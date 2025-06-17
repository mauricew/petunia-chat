import { Popover } from "@base-ui-components/react";

type RelativeTimeProps = {
  alignPopup?: 'center' | 'start' | 'end' | undefined;
  className?: string | undefined;
  date: Date;
}

// Shoutouts to https://www.builder.io/blog/relative-time
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const unitLengths = [60, 3600, 86400, 86400 * 7, 86400 * 30];
const unitNames: Array<Intl.RelativeTimeFormatUnit> = ['second', 'minute', 'hour', 'day', 'week', 'month'];

export default function RelativeTime(props: RelativeTimeProps) {
  const { alignPopup, className, date } = props;

  const delta = Math.round((date.getTime() - new Date().getTime()) / 1000);
  const unitIndex = unitLengths.findIndex(c => c > Math.abs(delta));
  const divisor = unitIndex ? unitLengths[unitIndex - 1] : 1;

  const relativeDisplay = relativeFormatter.format(Math.floor(delta / divisor), unitNames[unitIndex])

  return (
    <Popover.Root openOnHover>
      <Popover.Trigger>
        <time dateTime={date.toISOString()}>{relativeDisplay}</time>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align={alignPopup}>
          <Popover.Popup className="-mx-2 px-2 py-1 bg-slate-100 dark:bg-slate-900">
            <Popover.Description className={`text-xs ${className ?? ''}`}>{date.toLocaleString()}</Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
      
    </Popover.Root>
  )
}