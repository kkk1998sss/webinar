import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { MoreVertical } from 'lucide-react';

import { Button } from './ui/button';
type Webinar = {
  webinarTitle: string;
  webinarSettings?: {
    registrants?: number;
    attendees?: number;
    status?: string;
  };
};
const WebinarCard = ({ webinar }: { webinar: Webinar }) => (
  <div className="relative rounded-lg bg-white p-4 shadow-md">
    <div className="absolute right-2 top-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit webinar</DropdownMenuItem>
          <DropdownMenuItem>Get links</DropdownMenuItem>
          <DropdownMenuItem>View analytics</DropdownMenuItem>
          <DropdownMenuItem>View chat history</DropdownMenuItem>
          <DropdownMenuItem>Edit tags</DropdownMenuItem>
          <DropdownMenuItem>Clone webinar</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Delete webinar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <h3 className="text-xl font-semibold">{webinar.webinarTitle}</h3>
    <p className="text-sm text-gray-500">
      {webinar.webinarSettings?.registrants || 0} registrants,{' '}
      {webinar.webinarSettings?.attendees || 0} attendees
    </p>
    <div className="mt-2 flex gap-2">
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        Automated
      </span>
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        {webinar.webinarSettings?.status || 'Active'}
      </span>
    </div>
  </div>
);

export default WebinarCard;
