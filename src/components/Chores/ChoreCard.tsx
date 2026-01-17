import type { Chore } from '../../types';
import { useTeam } from '../../context/TeamContext';

interface ChoreCardProps {
  chore: Chore;
  onClick: () => void;
  onComplete: () => void;
  compact?: boolean;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export function ChoreCard({ chore, onClick, onComplete, compact = false }: ChoreCardProps) {
  const { getMember } = useTeam();
  const member = chore.assigneeId ? getMember(chore.assigneeId) : null;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="group flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: member ? `${member.color}20` : '#f3f4f6',
          borderLeft: `3px solid ${member?.color ?? '#9ca3af'}`,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="w-3 h-3 rounded border border-gray-400 hover:bg-green-500 hover:border-green-500 flex-shrink-0 transition-colors"
          aria-label="Complete chore"
        />
        <span className="truncate font-medium" style={{ color: member?.color ?? '#374151' }}>
          {chore.title}
        </span>
        {chore.recurrence && (
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 hover:bg-green-500 hover:border-green-500 flex-shrink-0 transition-colors"
          aria-label="Complete chore"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{chore.title}</h4>
            {chore.recurrence && (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </div>
          {chore.description && (
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{chore.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[chore.priority]}`}>
              {chore.priority}
            </span>
            {member && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${member.color}20`, color: member.color }}
              >
                {member.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
