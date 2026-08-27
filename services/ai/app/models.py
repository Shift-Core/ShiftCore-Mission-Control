from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


SCHEMA_VERSION = "1.0"
SNAPSHOT_SOURCE = "core-mission-control-v1"


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class KpiSnapshot(StrictModel):
    plannedTasks: int = Field(ge=0)
    toDoTasks: int = Field(ge=0)
    inProgressTasks: int = Field(ge=0)
    doneTasks: int = Field(ge=0)
    completionRate: float = Field(ge=0, le=100)
    activeBlockers: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_release_kpis(self) -> "KpiSnapshot":
        status_total = (
            self.toDoTasks
            + self.inProgressTasks
            + self.doneTasks
        )

        if self.plannedTasks != status_total:
            raise ValueError(
                "plannedTasks must equal "
                "toDoTasks + inProgressTasks + doneTasks"
            )

        expected_rate = (
            round(
                (self.doneTasks / self.plannedTasks) * 100,
                1,
            )
            if self.plannedTasks
            else 0.0
        )

        if abs(self.completionRate - expected_rate) > 0.05:
            raise ValueError(
                "completionRate must be "
                f"{expected_rate} for the supplied KPI counts"
            )

        return self


class SummaryPreviewRequest(StrictModel):
    schemaVersion: Literal["1.0"] = SCHEMA_VERSION
    projectId: str = Field(min_length=1)
    sprintId: str = Field(min_length=1)

    snapshotSource: Literal[
        "core-mission-control-v1"
    ] = SNAPSHOT_SOURCE

    snapshot: KpiSnapshot


class SummarySection(StrictModel):
    key: Literal[
        "progress",
        "blockers",
        "attention",
    ]

    title: str = Field(min_length=1)
    content: str = Field(min_length=1)


class SummaryPreviewData(StrictModel):
    source: Literal["deterministic"] = "deterministic"

    schemaVersion: Literal["1.0"] = SCHEMA_VERSION

    projectId: str = Field(min_length=1)
    sprintId: str = Field(min_length=1)

    generatedAt: datetime

    sourceSnapshot: KpiSnapshot

    sections: list[SummarySection] = Field(
        min_length=3,
        max_length=3,
    )

    warnings: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_required_sections(
        self,
    ) -> "SummaryPreviewData":
        expected = [
            "progress",
            "blockers",
            "attention",
        ]

        actual = [
            section.key
            for section in self.sections
        ]

        if actual != expected:
            raise ValueError(
                "sections must appear exactly in this order: "
                "progress, blockers, attention"
            )

        return self


class SummaryPreviewResponse(StrictModel):
    success: Literal[True] = True

    message: Literal[
        "Weekly summary preview generated"
    ] = "Weekly summary preview generated"

    data: SummaryPreviewData

class ErrorResponse(StrictModel):
    success: Literal[False] = False
    message: str = Field(min_length=1)
    data: None = None
    errorCode: str = Field(min_length=1)
    errors: list[dict[str, str]] = Field(default_factory=list)
    traceId: str = Field(min_length=1)
