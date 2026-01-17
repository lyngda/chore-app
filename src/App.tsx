import { useState } from 'react';
import { addWeeks, addMonths } from 'date-fns';
import { WebSocketSyncProvider } from './context/WebSocketSyncContext';
import { TeamProvider } from './context/TeamContext';
import { ChoreProvider, useChores } from './context/ChoreContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { CalendarView } from './components/Calendar/CalendarView';
import { ChoreForm } from './components/Chores/ChoreForm';
import type { CalendarView as CalendarViewType, Chore } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [selectedChore, setSelectedChore] = useState<Chore | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { completeChore } = useChores();

  const handlePrev = () => {
    if (currentView === 'week') {
      setCurrentDate((d) => addWeeks(d, -1));
    } else {
      setCurrentDate((d) => addMonths(d, -1));
    }
  };

  const handleNext = () => {
    if (currentView === 'week') {
      setCurrentDate((d) => addWeeks(d, 1));
    } else {
      setCurrentDate((d) => addMonths(d, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedChore(undefined);
    setSelectedDate(date);
    setShowChoreForm(true);
  };

  const handleChoreClick = (chore: Chore) => {
    setSelectedChore(chore);
    setSelectedDate(undefined);
    setShowChoreForm(true);
  };

  const handleChoreComplete = (choreId: string) => {
    // For shared device, we can optionally prompt which member completed it
    // For simplicity, we'll just complete without assigning
    completeChore(choreId, null);
  };

  const handleCloseForm = () => {
    setShowChoreForm(false);
    setSelectedChore(undefined);
    setSelectedDate(undefined);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-white border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Click a date to add a chore, or click a chore to edit it
            </p>
            <button
              onClick={() => {
                setSelectedChore(undefined);
                setSelectedDate(new Date());
                setShowChoreForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Chore
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            <CalendarView
              view={currentView}
              currentDate={currentDate}
              onDateClick={handleDateClick}
              onChoreClick={handleChoreClick}
              onChoreComplete={handleChoreComplete}
            />
          </div>
        </main>
      </div>

      {showChoreForm && (
        <ChoreForm
          chore={selectedChore}
          initialDate={selectedDate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <WebSocketSyncProvider>
      <TeamProvider>
        <ChoreProvider>
          <AppContent />
        </ChoreProvider>
      </TeamProvider>
    </WebSocketSyncProvider>
  );
}

export default App;
