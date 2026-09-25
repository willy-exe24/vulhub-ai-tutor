import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

COMMAND_TIMEOUT_SECONDS = 15
POWER_TIMEOUT_SECONDS = 60

# Common install locations, checked when vmrun.exe isn't on PATH.
_COMMON_VMRUN_PATHS = (
    Path(r"C:\Program Files\VMware\VMware Workstation\vmrun.exe"),
    Path(r"C:\Program Files (x86)\VMware\VMware Workstation\vmrun.exe"),
    Path(r"C:\Program Files (x86)\VMware\VMware Player\vmrun.exe"),
)

# Default place VMware Workstation keeps VMs on Windows, used for auto-discovery
# when VM_LIBRARY_PATH isn't set.
DEFAULT_VM_LIBRARY_PATH = Path.home() / "Documents" / "Virtual Machines"


class VmwareError(Exception):
    """Raised when vmrun can't be found or a VM operation fails."""


@dataclass(frozen=True)
class VmStatus:
    configured: bool
    available: bool  # vmrun itself is usable
    running: bool
    vmx_path: str | None
    error: str | None = None


@dataclass(frozen=True)
class DiscoveredVm:
    name: str
    vmx_path: str
    running: bool


def find_vmrun() -> Path | None:
    on_path = shutil.which("vmrun")
    if on_path:
        return Path(on_path)
    for candidate in _COMMON_VMRUN_PATHS:
        if candidate.is_file():
            return candidate
    return None


def _normalize(path: Path) -> str:
    return str(path.resolve()).lower()


def _run_vmrun(args: list[str], timeout: int = COMMAND_TIMEOUT_SECONDS) -> subprocess.CompletedProcess:
    vmrun = find_vmrun()
    if vmrun is None:
        raise VmwareError("vmrun.exe not found (checked PATH and common VMware install locations)")
    try:
        return subprocess.run([str(vmrun), *args], capture_output=True, text=True, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise VmwareError(f"Failed to run vmrun {' '.join(args)}: {exc}") from exc


def list_running_vmx() -> set[str]:
    proc = _run_vmrun(["list"])
    if proc.returncode != 0:
        raise VmwareError(proc.stderr.strip() or "vmrun list failed")
    return {_normalize(Path(line.strip())) for line in proc.stdout.splitlines()[1:] if line.strip()}


def discover_vms(library_path: Path | None = None) -> list[DiscoveredVm]:
    """Scan a directory (default: VMware's default Windows library) for .vmx files."""
    library_path = library_path or DEFAULT_VM_LIBRARY_PATH
    if not library_path.is_dir():
        return []

    try:
        running = list_running_vmx()
    except VmwareError:
        running = set()

    found: list[DiscoveredVm] = []
    for vmx_path in sorted(library_path.glob("*/*.vmx")):
        found.append(
            DiscoveredVm(
                name=vmx_path.parent.name,
                vmx_path=str(vmx_path.resolve()),
                running=_normalize(vmx_path) in running,
            )
        )
    return found


def get_vm_status(vmx_path: Path | None) -> VmStatus:
    if vmx_path is None:
        return VmStatus(configured=False, available=False, running=False, vmx_path=None)

    if find_vmrun() is None:
        return VmStatus(
            configured=True,
            available=False,
            running=False,
            vmx_path=str(vmx_path),
            error="vmrun.exe not found (checked PATH and common VMware install locations)",
        )

    if not vmx_path.is_file():
        return VmStatus(
            configured=True,
            available=True,
            running=False,
            vmx_path=str(vmx_path),
            error=f"Configured .vmx path does not exist: {vmx_path}",
        )

    try:
        running = list_running_vmx()
    except VmwareError as exc:
        return VmStatus(configured=True, available=False, running=False, vmx_path=str(vmx_path), error=str(exc))

    return VmStatus(configured=True, available=True, running=_normalize(vmx_path) in running, vmx_path=str(vmx_path))


def start_vm(vmx_path: Path, gui: bool = True) -> None:
    mode = "gui" if gui else "nogui"
    proc = _run_vmrun(["start", str(vmx_path), mode], timeout=POWER_TIMEOUT_SECONDS)
    if proc.returncode != 0:
        raise VmwareError(proc.stderr.strip() or proc.stdout.strip() or "vmrun start failed")


def stop_vm(vmx_path: Path, soft: bool = True) -> None:
    mode = "soft" if soft else "hard"
    proc = _run_vmrun(["stop", str(vmx_path), mode], timeout=POWER_TIMEOUT_SECONDS)
    if proc.returncode != 0:
        raise VmwareError(proc.stderr.strip() or proc.stdout.strip() or "vmrun stop failed")


