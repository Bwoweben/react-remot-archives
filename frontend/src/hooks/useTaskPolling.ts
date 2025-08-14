// /*
// ================================================================================
// File: src/hooks/useTaskPolling.ts
// Description: A custom hook to periodically check the status of a
//              background task until it is complete.
// ================================================================================
// */
// import { useState, useEffect } from 'react';
// import { getTaskStatus } from '../services/co2Api';
// import { type TaskStatusResponse } from '../types';

// export const useTaskPolling = (
//   taskId: string | null,
//   onSuccess: (result: any) => void,
//   onError: () => void
// ) => {
//   const [status, setStatus] = useState<string | null>(null);

//   useEffect(() => {
//     if (!taskId) {
//       setStatus(null);
//       return;
//     }

//     setStatus('PENDING');
//     const interval = setInterval(async () => {
//       try {
//         const response = await getTaskStatus(taskId);
//         setStatus(response.status);

//         if (response.status === 'SUCCESS') {
//           clearInterval(interval);
//           onSuccess(response.result);
//         } else if (response.status === 'FAILURE') {
//           clearInterval(interval);
//           onError();
//         }
//       } catch (error) {
//         clearInterval(interval);
//         onError();
//       }
//     }, 3000); // Poll every 3 seconds

//     return () => clearInterval(interval); // Cleanup on unmount or taskId change
//   }, [taskId, onSuccess, onError]);

//   return status;
// };
