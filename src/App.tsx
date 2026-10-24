/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PredictionView } from './components/PredictionView';
import { PredictionResultModal } from './components/PredictionResultModal';
import { StudentManagementView } from './components/StudentManagementView';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { AnalyticsView } from './components/AnalyticsView';
import { PredictionHistoryView } from './components/PredictionHistoryView';
import { ModelInsightsView } from './components/ModelInsightsView';
import { DocumentationView } from './components/DocumentationView';
import { PrintReportModal } from './components/PrintReportModal';

import { storageService } from './services/storage';
import { Student, PredictionInput, PredictionRecord } from './types';
import { ThemeProvider } from './context/ThemeContext';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data state
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [predictions, setPredictions] = useState<PredictionRecord[]>(() =>
    storageService.getPredictions()
  );

  // Modal states
  const [predictionResult, setPredictionResult] = useState<PredictionRecord | null>(null);
  const [reportToPrint, setReportToPrint] = useState<PredictionRecord | null>(null);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [studentToPredict, setStudentToPredict] = useState<Student | null>(null);

  const refreshData = () => {
    setStudents(storageService.getStudents());
    setPredictions(storageService.getPredictions());
  };

  const stats = useMemo(() => {
    return storageService.getDashboardStats();
  }, [students, predictions]);

  const tabMetadata: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'College Academic Dashboard',
      subtitle: 'Overview of student cohort, attendance benchmarks, and machine learning forecasts',
    },
    predict: {
      title: 'Predict Student Performance',
      subtitle: 'Input academic parameters to compute expected final marks with confidence interval',
    },
    students: {
      title: 'College Student Records',
      subtitle: 'Manage enrolled candidates, continuous assessment scores, and attendance',
    },
    analytics: {
      title: 'Academic Analytics & Empirical Trends',
      subtitle: 'Deep-dive correlations between attendance, continuous testing, and final grades',
    },
    history: {
      title: 'Prediction Audit Log & History',
      subtitle: 'Chronological record of all executed model evaluations with export capabilities',
    },
    models: {
      title: 'Machine Learning Model Insights',
      subtitle: 'Random Forest Regressor vs Linear Regression baseline evaluation on held-out test split',
    },
    docs: {
      title: 'College Project Documentation & Viva Guide',
      subtitle: 'Project synopsis, architecture diagrams, DFD, schemas, and examiner Q&A',
    },
  };

  const handlePredict = (input: PredictionInput): PredictionRecord => {
    const record = storageService.createPrediction(input);
    refreshData();
    return record;
  };

  const handlePredictionComplete = (result: PredictionRecord) => {
    setPredictionResult(result);
  };

  const handleResetData = () => {
    storageService.resetDemoData();
    refreshData();
  };

  const handleSaveStudent = (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    let res;
    if (studentToEdit) {
      res = storageService.updateStudent(studentToEdit.id, data);
    } else {
      res = storageService.addStudent(data);
    }
    if (res.success) {
      refreshData();
      setIsStudentFormOpen(false);
      setStudentToEdit(null);
    }
    return res;
  };

  const handleDeleteStudent = (id: string) => {
    storageService.deleteStudent(id);
    refreshData();
    if (studentToView?.id === id) {
      setStudentToView(null);
    }
  };

  const handleDeletePrediction = (id: string) => {
    storageService.deletePrediction(id);
    refreshData();
  };

  const handleClearHistory = () => {
    storageService.clearPredictions();
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (tab !== 'predict') {
            setStudentToPredict(null);
          }
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        totalStudents={students.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenPredict={() => {
            setStudentToPredict(null);
            setActiveTab('predict');
          }}
          onResetData={handleResetData}
          title={tabMetadata[activeTab].title}
          subtitle={tabMetadata[activeTab].subtitle}
          onOpenDocs={() => setActiveTab('docs')}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              students={students}
              predictions={predictions}
              onOpenPredict={() => {
                setStudentToPredict(null);
                setActiveTab('predict');
              }}
              onNavigateToStudents={() => setActiveTab('students')}
              onNavigateToAnalytics={() => setActiveTab('analytics')}
              onViewPrediction={pred => setPredictionResult(pred)}
              onSelectStudentToPredict={student => {
                setStudentToPredict(student);
                setActiveTab('predict');
              }}
            />
          )}

          {activeTab === 'predict' && (
            <PredictionView
              students={students}
              initialStudent={studentToPredict}
              onPredict={handlePredict}
              onPredictionComplete={handlePredictionComplete}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagementView
              students={students}
              onAddStudent={() => {
                setStudentToEdit(null);
                setIsStudentFormOpen(true);
              }}
              onEditStudent={student => {
                setStudentToEdit(student);
                setIsStudentFormOpen(true);
              }}
              onViewStudent={student => setStudentToView(student)}
              onDeleteStudent={handleDeleteStudent}
              onPredictStudent={student => {
                setStudentToPredict(student);
                setActiveTab('predict');
              }}
              onResetData={handleResetData}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView students={students} predictions={predictions} />
          )}

          {activeTab === 'history' && (
            <PredictionHistoryView
              predictions={predictions}
              onViewPrediction={pred => setPredictionResult(pred)}
              onPrintPrediction={pred => setReportToPrint(pred)}
              onDeletePrediction={handleDeletePrediction}
              onClearHistory={handleClearHistory}
              onOpenPredict={() => {
                setStudentToPredict(null);
                setActiveTab('predict');
              }}
            />
          )}

          {activeTab === 'models' && (
            <ModelInsightsView onModelRetrained={() => refreshData()} />
          )}

          {activeTab === 'docs' && <DocumentationView />}
        </main>
      </div>

      {/* Prediction Result Modal */}
      <PredictionResultModal
        prediction={predictionResult}
        onClose={() => setPredictionResult(null)}
        onPrint={pred => setReportToPrint(pred)}
      />

      {/* Printable Report Modal */}
      <PrintReportModal
        prediction={reportToPrint}
        onClose={() => setReportToPrint(null)}
      />

      {/* Student Form Modal (Add / Edit) */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setStudentToEdit(null);
        }}
        onSubmit={handleSaveStudent}
        initialData={studentToEdit}
      />

      {/* Student Details View Modal */}
      <StudentDetailsModal
        student={studentToView}
        onClose={() => setStudentToView(null)}
        onEdit={student => {
          setStudentToView(null);
          setStudentToEdit(student);
          setIsStudentFormOpen(true);
        }}
        onDelete={id => handleDeleteStudent(id)}
        onPredict={student => {
          setStudentToPredict(student);
          setActiveTab('predict');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
