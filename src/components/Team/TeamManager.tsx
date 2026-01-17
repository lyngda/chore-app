import { useState } from 'react';
import { useTeam, MEMBER_COLORS } from '../../context/TeamContext';
import { MemberBadge } from './MemberBadge';

export function TeamManager() {
  const { members, addMember, removeMember } = useTeam();
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEMBER_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      addMember(newMemberName.trim(), selectedColor);
      setNewMemberName('');
      setSelectedColor(MEMBER_COLORS[(members.length + 1) % MEMBER_COLORS.length]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Team Members</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Add member..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMemberName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Color:</span>
          <div className="flex gap-1">
            {MEMBER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </form>

      {members.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No team members yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <MemberBadge
              key={member.id}
              member={member}
              onRemove={() => removeMember(member.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
