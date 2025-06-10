import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@/Layout';
import { routeArray } from '@/config/routes';
import HomePage from '@/components/pages/HomePage';
import NotFoundPage from '@/components/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            {routeArray.map(route => {
              const Component = route.component;
              return (
                <Route 
                  key={route.id} 
                  path={route.path} 
                  element={<Component />} 
                />
              );
            })}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
          toastClassName="bg-white shadow-lg rounded-lg"
          bodyClassName="text-gray-700"
          progressClassName="bg-primary"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;