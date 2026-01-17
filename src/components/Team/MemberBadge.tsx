import type { TeamMember } from '../../types';

interface MemberBadgeProps {
  member: TeamMember;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function MemberBadge({ member, onRemove, size = 'md' }: MemberBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: `${member.color}20`, color: member.color }}
    >
      <span
        className={`rounded-full ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
        style={{ backgroundColor: member.color }}
      />
      {member.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${member.name}`}
        >
          <svg className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
