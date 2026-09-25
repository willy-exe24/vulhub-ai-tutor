"""Reads metadata out of a lab's docker-compose file — just enough to show
the user what port(s) it exposes. The app never runs Docker itself."""

from dataclasses import dataclass
from pathlib import Path

import yaml


@dataclass(frozen=True)
class PortMapping:
    host_port: int
    container_port: int
    protocol: str


def _parse_port_entry(entry) -> PortMapping | None:
    protocol = "tcp"

    if isinstance(entry, dict):
        published = entry.get("published")
        target = entry.get("target")
        protocol = entry.get("protocol", "tcp")
        if published in (None, "") or target is None:
            return None
        try:
            return PortMapping(host_port=int(published), container_port=int(target), protocol=protocol)
        except (TypeError, ValueError):
            return None

    if isinstance(entry, int):
        return None  # bare container port, not published to the host

    text = str(entry)
    if "/" in text:
        text, protocol = text.rsplit("/", 1)

    parts = text.split(":")
    try:
        if len(parts) == 2:
            host, container = parts
            return PortMapping(host_port=int(host), container_port=int(container), protocol=protocol)
        if len(parts) == 3:
            _ip, host, container = parts
            return PortMapping(host_port=int(host), container_port=int(container), protocol=protocol)
    except ValueError:
        return None
    return None


def parse_compose_ports_text(yaml_text: str | None) -> list[PortMapping]:
    if not yaml_text:
        return []
    try:
        data = yaml.safe_load(yaml_text) or {}
    except yaml.YAMLError:
        return []

    ports: list[PortMapping] = []
    for service in (data.get("services") or {}).values():
        for entry in service.get("ports") or []:
            parsed = _parse_port_entry(entry)
            if parsed is not None:
                ports.append(parsed)
    return ports


def parse_compose_ports(compose_path: Path) -> list[PortMapping]:
    try:
        text = compose_path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return []
    return parse_compose_ports_text(text)
