import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PipelineTemplateProvider } from "@/contexts/PipelineTemplateContext";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { RolesProvider } from "@/contexts/RolesContext";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import PipelineSettingsPage from "./pages/PipelineSettingsPage";
import RolesSettingsPage from "./pages/RolesSettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PipelineTemplateProvider>
        <ProjectsProvider>
          <RolesProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/settings/pipeline" element={<PipelineSettingsPage />} />
                  <Route path="/settings/roles" element={<RolesSettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </RolesProvider>
        </ProjectsProvider>
      </PipelineTemplateProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
