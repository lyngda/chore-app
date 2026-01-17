import { useChores } from '../../context/ChoreContext';
import { useTeam } from '../../context/TeamContext';
import { format, parseISO } from 'date-fns';

export function CompletionLog() {
  const { completedChores } = useChores();
  const { getMember } = useTeam();

  if (completedChores.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Completion History</h3>
        <p className="text-sm text-gray-500 italic">No completed chores yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Completion History</h3>
      <ul className="space-y-2">
        {completedChores.slice(0, 20).map((entry) => {
          const member = entry.completedBy ? getMember(entry.completedBy) : null;
          return (
            <li
              key={entry.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{entry.choreTitle}</p>
                  {member && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      by{' '}
                      <span style={{ color: member.color }}>{member.name}</span>
                    </p>
                  )}
                </div>
                <time className="text-xs text-gray-500 whitespace-nowrap">
                  {format(parseISO(entry.completedAt), 'MMM d, h:mm a')}
                </time>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
