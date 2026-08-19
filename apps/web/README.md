# ShiftCore Web

Frontend shell for the R24-06 release slice.

## Update — R24-06 Implementation / Review Follow-up

`README.md` has been completed to document the frontend release shell and R24-04 runtime contract, including:

- Frontend routes:
  - `/login`
  - `/mission-control`
  - `/sign-in-unavailable`
- API client configuration using the gateway-relative `/api` base path.
- Credentials handling through `credentials: 'include'`.
- Authentication behavior and the fact that frontend authentication tokens are not stored in `localStorage` or `sessionStorage`.
- Local development commands:
  - `npm ci`
  - `npm run dev`
  - `npm run build`
- Docker build/start instructions.
- Runtime/environment configuration.
- Frontend health behavior and Nginx serving configuration.

The README is no longer truncated and now provides the required development, build, runtime, and Docker notes.

### Mission Control — Updated

The Mission Control implementation has been expanded from the initial shell into the committed UI structure.

The implementation now includes the Mission Control sections/components from the approved UI work, including:

- Mission header
- Project overview
- Sprint metrics
- Task board
- Task cards
- Active blocker
- Weekly summary
- Mission state
- Start Task UI/dialog

### Start Task UI

A dedicated **Start Task** interaction has been implemented as part of the Mission Control UI.

The Start Task flow now includes the UI required to select/start a task and confirm or cancel the action.

The current implementation remains UI/fixture-driven where live endpoint integration is outside the R24-06 scope. The API integration can be connected through the existing shared API client when the corresponding backend contract is available.

### Authentication / No Token Storage

The authentication skeleton continues to use React in-memory state only.

- No authentication token is written to `localStorage`.
- No authentication token is written to `sessionStorage`.
- No frontend token persistence has been introduced.
- API requests continue to use gateway-relative paths

This preserves the R24-06 requirement that frontend token storage is out of scope.

### Verification Status

The existing automated checks remain passing for the PR, including the configuration validation and changed-area checks.

The previously identified README completeness issue is resolved, and the Mission Control implementation has been expanded to include the committed UI and Start Task interaction.

The implementation remains within the R24-06 boundary: live API integration, full role behavior, deferred dashboard screens, complete task-board filters/actions, and full summary review/edit behavior remain outside the committed slice unless explicitly delivered by a later R24 item.
