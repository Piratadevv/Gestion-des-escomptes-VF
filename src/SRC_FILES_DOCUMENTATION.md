# Project Source Files Documentation

This document provides a simple overview of each file in the `src` directory, including its purpose, technologies used, and whether it is for the front end or back end.

---

## Root Files

### App.tsx
- **Purpose:** Main React application component.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### App.css
- **Purpose:** Global styles for the app.
- **Technologies:** CSS.
- **Front/Back End:** Front end

### index.tsx
- **Purpose:** Entry point for React app rendering.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### index.css
- **Purpose:** Global CSS styles.
- **Technologies:** CSS.
- **Front/Back End:** Front end

---

## components/

### Auth/LoginForm.tsx
- **Purpose:** User login form.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Auth/ProtectedRoute.tsx
- **Purpose:** Route protection for authenticated users.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Configuration/ConfigurationModal.tsx
- **Purpose:** Modal for configuration settings.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Dashboard/Dashboard.tsx
- **Purpose:** Main dashboard view.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Dashboard/EscomptesDashboard.tsx
- **Purpose:** Dashboard for escomptes data.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Dashboard/KPICard.tsx
- **Purpose:** KPI display card.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Dashboard/RefinancementsDashboard.tsx
- **Purpose:** Dashboard for refinancements data.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Dashboard/StatCard.tsx
- **Purpose:** Statistic display card.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Escomptes/EscompteModal.tsx
- **Purpose:** Modal for escompte details.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Escomptes/EscomptesTable.tsx
- **Purpose:** Table for escomptes data.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Escomptes/SearchFilters.tsx
- **Purpose:** Search filters for escomptes.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Layout/EdgeSwipeDetector.tsx
- **Purpose:** Detects edge swipe gestures.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Layout/Header.tsx
- **Purpose:** App header component.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Layout/Sidebar.tsx
- **Purpose:** Sidebar navigation.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Logs/LogEntry.tsx
- **Purpose:** Displays a log entry.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Logs/LogFilters.tsx
- **Purpose:** Filters for logs.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Pages/EscomptesPage.tsx
- **Purpose:** Page for escomptes management.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Pages/LogsPage.tsx
- **Purpose:** Page for viewing logs.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Pages/RefinancementsPage.tsx
- **Purpose:** Page for refinancements management.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Refinancements/RefinancementModal.tsx
- **Purpose:** Modal for refinancement details.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### Refinancements/RefinancementsTable.tsx
- **Purpose:** Table for refinancements data.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/ConfirmationModal.tsx
- **Purpose:** Confirmation dialog modal.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/ExportModal.tsx
- **Purpose:** Modal for exporting data.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/LoadingOverlay.tsx
- **Purpose:** Overlay for loading state.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/LoadingSpinner.tsx
- **Purpose:** Spinner for loading indication.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/Modal.tsx
- **Purpose:** Generic modal component.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/ModalContainer.tsx
- **Purpose:** Container for modals.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/NotificationContainer.tsx
- **Purpose:** Container for notifications.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/Pagination.tsx
- **Purpose:** Pagination controls.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/RefinancementsExportModal.tsx
- **Purpose:** Modal for exporting refinancements.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

### UI/SaveButton.tsx
- **Purpose:** Save button component.
- **Technologies:** React, TypeScript.
- **Front/Back End:** Front end

---

## contexts/

### AuthContext.tsx
- **Purpose:** Authentication context provider.
- **Technologies:** React, TypeScript, Context API.
- **Front/Back End:** Front end

---

## services/api/

### client.ts
- **Purpose:** API client setup.
- **Technologies:** TypeScript, Axios or fetch (likely).
- **Front/Back End:** Front end

### configurationApi.ts
- **Purpose:** API calls for configuration.
- **Technologies:** TypeScript, Axios or fetch.
- **Front/Back End:** Front end

### dashboardApi.ts
- **Purpose:** API calls for dashboard data.
- **Technologies:** TypeScript, Axios or fetch.
- **Front/Back End:** Front end

### escomptesApi.ts
- **Purpose:** API calls for escomptes data.
- **Technologies:** TypeScript, Axios or fetch.
- **Front/Back End:** Front end

### logsService.ts
- **Purpose:** API calls for logs.
- **Technologies:** TypeScript, Axios or fetch.
- **Front/Back End:** Front end

### mockClient.ts
- **Purpose:** Mock API client for testing.
- **Technologies:** TypeScript.
- **Front/Back End:** Front end

### refinancementsApi.ts
- **Purpose:** API calls for refinancements data.
- **Technologies:** TypeScript, Axios or fetch.
- **Front/Back End:** Front end

---

## store/

### index.ts
- **Purpose:** Store setup (Redux or similar).
- **Technologies:** TypeScript, Redux (likely).
- **Front/Back End:** Front end

### middleware/loggingMiddleware.ts
- **Purpose:** Middleware for logging actions.
- **Technologies:** TypeScript, Redux middleware.
- **Front/Back End:** Front end

### slices/configurationSlice.ts
- **Purpose:** State slice for configuration.
- **Technologies:** TypeScript, Redux slice.
- **Front/Back End:** Front end

### slices/dashboardSlice.ts
- **Purpose:** State slice for dashboard.
- **Technologies:** TypeScript, Redux slice.
- **Front/Back End:** Front end

### slices/escomptesSlice.ts
- **Purpose:** State slice for escomptes.
- **Technologies:** TypeScript, Redux slice.
- **Front/Back End:** Front end

### slices/logsSlice.ts
- **Purpose:** State slice for logs.
- **Technologies:** TypeScript, Redux slice.
- **Front/Back End:** Front end

### slices/refinancementsSlice.ts
- **Purpose:** State slice for refinancements.
- **Technologies:** TypeScript, Redux slice.
- **Front/Back End:** Front end

### slices/uiSlice.ts
- **Purpose:** State slice for UI state.
- **Technologies:** TypeScript, Redux slice.
- **Front/Back End:** Front end

---

## styles/

### responsive-utilities.css
- **Purpose:** Utility CSS for responsive design.
- **Technologies:** CSS.
- **Front/Back End:** Front end

---

## types/

### index.ts
- **Purpose:** Type definitions for the project.
- **Technologies:** TypeScript.
- **Front/Back End:** Front end

---

## utils/

### calculations.ts
- **Purpose:** Utility functions for calculations.
- **Technologies:** TypeScript.
- **Front/Back End:** Front end

### dates.ts
- **Purpose:** Utility functions for date handling.
- **Technologies:** TypeScript.
- **Front/Back End:** Front end

### loggingUtils.ts
- **Purpose:** Utility functions for logging.
- **Technologies:** TypeScript.
- **Front/Back End:** Front end

### validation.ts
- **Purpose:** Utility functions for validation.
- **Technologies:** TypeScript.
- **Front/Back End:** Front end

---

All files in `src` are for the front end and use React, TypeScript, and CSS technologies as appropriate.