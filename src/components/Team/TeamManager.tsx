import { useState } from 'react';
import { useTeam } from '../../context/TeamContext';
import { MemberBadge } from './MemberBadge';

export function TeamManager() {
  const { members, addMember, removeMember } = useTeam();
  const [newMemberName, setNewMemberName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      addMember(newMemberName.trim());
      setNewMemberName('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Team Members</h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
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
