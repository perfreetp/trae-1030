import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import EventReport from '../pages/EventReport';
import ResourceDispatch from '../pages/ResourceDispatch';
import PlanExecute from '../pages/PlanExecute';
import SiteFeedback from '../pages/SiteFeedback';
import InfoPublish from '../pages/InfoPublish';
import Summary from '../pages/Summary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'event-report',
        element: <EventReport />,
      },
      {
        path: 'resource-dispatch',
        element: <ResourceDispatch />,
      },
      {
        path: 'plan-execute',
        element: <PlanExecute />,
      },
      {
        path: 'site-feedback',
        element: <SiteFeedback />,
      },
      {
        path: 'info-publish',
        element: <InfoPublish />,
      },
      {
        path: 'summary',
        element: <Summary />,
      },
    ],
  },
]);

export default router;
