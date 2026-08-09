import json
from pathlib import Path

from app.models import KpiSnapshot


FIXTURE = (
    Path(__file__).resolve().parents[1]
    / "fixtures"
    / "source_snapshot.v1.json"
)


def test_approved_seed_kpi_values():
    payload = json.loads(FIXTURE.read_text(encoding="utf-8"))
    snapshot = KpiSnapshot.model_validate(payload["snapshot"])

    assert snapshot.plannedTasks == 3
    assert snapshot.toDoTasks == 1
    assert snapshot.inProgressTasks == 1
    assert snapshot.doneTasks == 1
    assert snapshot.completionRate == 33.3
    assert snapshot.activeBlockers == 1


def test_zero_planned_tasks_has_zero_completion_rate():
    snapshot = KpiSnapshot(
        plannedTasks=0,
        toDoTasks=0,
        inProgressTasks=0,
        doneTasks=0,
        completionRate=0,
        activeBlockers=0,
    )

    assert snapshot.completionRate == 0
