# TODO: Fix 404 on "View Project"

## Steps to Complete

1. [x] Update `actions/projects.js`: Modify `getProject` to accept `orgId` parameter and use it for organization verification instead of `auth().orgId`. Change `!project` check to return `null` for consistency.

2. [x] Update `app/(main)/organization/[orgId]/_components/project-list.jsx`: Change the "View Project" Link `href` to `/organization/${orgId}/project/${project.id}` to nest under organization route.

3. [x] Create new file `app/(main)/organization/[orgId]/project/[projectId]/page.jsx`: Copy content from old project page, update to destructure `orgId` and `projectId` from params, call `getProject(projectId, orgId)`, and adjust relative imports/props if needed (e.g., pass `orgId` to `SprintBoard`).

4. [x] Edit old `app/(main)/project/[projectId]/page.jsx`: Update to redirect to `/organization/${auth().orgId}/project/${projectId}` if `orgId` from auth() exists; otherwise, show 404 or error.

5. [x] Test: Run `npm run dev`, navigate to organization page, click "View Project", verify no 404 and page loads correctly. Check for any broken links or components.

6. [x] Update TODO.md: Mark steps as complete and remove if all done.
