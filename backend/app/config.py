from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_path: Path = Path("data/vulhub_tutor.db")

    # Bundled copy of Vulhub's lab READMEs + docker-compose files, shipped
    # with this repo so the lab library works with zero setup. The app never
    # runs Docker itself — you clone the real vulhub repo onto your own
    # Vulhub VM separately and run labs there by hand.
    bundled_vulhub_path: Path = Path("vulhub_data")

    default_ai_provider: str = "openai"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-5"

    # Optional bootstrap defaults for VM integration — all of this is also
    # editable at runtime from Settings (stored in the app_settings table),
    # which takes precedence once set. These env vars just seed first run.
    kali_vmx_path: Path | None = None
    vulhub_vmx_path: Path | None = None

    # Directory to scan for .vmx files when auto-discovering VMs. Defaults to
    # VMware Workstation's standard Windows location.
    vm_library_path: Path | None = None

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.database_path.resolve()}"


settings = Settings()
