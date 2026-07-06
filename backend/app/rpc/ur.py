import threading
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Callable


class RobotStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    ERROR = "error"


class UrMethods:
    """
    Méthodes exposées via XML-RPC.
    C'est le robot (URScript) qui appelle ces fonctions pour reporter son état.
    """

    def __init__(self):
        print("[UrMethods] Instance créée")
        self._lock = threading.Lock()
        self._status: RobotStatus = RobotStatus.IDLE
        self._current_command_id: Optional[int] = None
        self._last_update: Optional[str] = None
        self._on_finished_callback: Optional[Callable[[], None]] = None

    def set_status_program_started(self) -> bool:
        with self._lock:
            self._status = RobotStatus.RUNNING
            self._last_update = datetime.now(timezone.utc).isoformat()
        print(f"[UR] Programme démarré à {self._last_update}")
        return True

    def set_status_program_finished(self) -> bool:
        with self._lock:
            self._status = RobotStatus.IDLE
            self._last_update = datetime.now(timezone.utc).isoformat()
            self._current_command_id = None
        print(f"[UR] Programme terminé à {self._last_update}")

        if self._on_finished_callback:
            self._on_finished_callback()

        return True

    def set_status_error(self, message: str = "") -> bool:
        with self._lock:
            self._status = RobotStatus.ERROR
            self._last_update = datetime.now(timezone.utc).isoformat()
        print(f"[UR] Erreur reportée : {message}")
        return True

    def get_status(self) -> dict:
        with self._lock:
            return {
                "status": self._status.value,
                "current_command_id": self._current_command_id,
                "last_update": self._last_update,
            }

    def is_busy(self) -> bool:
        with self._lock:
            return self._status == RobotStatus.RUNNING

    def set_current_command(self, command_id: int) -> None:
        with self._lock:
            self._current_command_id = command_id

    def register_on_finished(self, callback: Callable[[], None]) -> None:
        """Permet au gestionnaire de queue de s'abonner à la fin d'exécution."""
        self._on_finished_callback = callback


ur_methods = UrMethods()