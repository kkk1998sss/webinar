'use client';

import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { ArrowLeft, ChevronDown, HelpCircle, Settings } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function WebinarSetupPage() {
  const [webinarName, setWebinarName] = useState<string>('My Webinar');
  const [webinarTitle, setWebinarTitle] = useState<string>(
    'Why automated webinars can supercharge your business!'
  );
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(30);
  const [seconds, setSeconds] = useState<number>(0);
  const [attendeeSignIn, setAttendeeSignIn] = useState<boolean>(false);
  const [brandImage, setBrandImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBrandImage(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <div className="p-4 md:p-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            My Webinar
          </h1>

          <div className="relative">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">
                Switch to webinar
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[180px] justify-between"
                  >
                    {webinarName}
                    <ChevronDown className="ml-2 size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>My Webinar</DropdownMenuItem>
                  <DropdownMenuItem>Product Demo</DropdownMenuItem>
                  <DropdownMenuItem>Team Training</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-12 px-4 md:px-6">
        <div className="mb-6 flex h-1 overflow-hidden rounded bg-gray-300">
          <div className="w-1/4 bg-blue-600"></div>
        </div>
        <div className="flex justify-between">
          <div className="text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="mt-2 text-sm text-blue-600">Details</div>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-300 text-white">
              <span className="text-gray-600">2</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">Register</div>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-300 text-white">
              <span className="text-gray-600">3</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">Watch</div>
          </div>
          <div className="text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-300 text-white">
              <span className="text-gray-600">4</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">Other</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <Card className="mx-4 mb-6 md:mx-6">
        <CardHeader>
          <CardTitle>Webinar details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label htmlFor="webinar-name" className="text-gray-500">
                  Name
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="size-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Enter the name of your webinar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="webinar-name"
                type="text"
                value={webinarName}
                onChange={(e) => setWebinarName(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label htmlFor="webinar-title" className="text-gray-500">
                  Title
                </Label>
                <div className="flex items-center">
                  <Settings className="mr-2 size-4 cursor-pointer text-purple-600 hover:text-purple-800" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="size-4 text-gray-400 hover:text-gray-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          Enter the title for your webinar
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Input
                id="webinar-title"
                type="text"
                value={webinarTitle}
                onChange={(e) => setWebinarTitle(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label className="text-gray-500">Webinar duration</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="size-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Set the duration of your webinar
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label
                    htmlFor="hours"
                    className="mb-1 block text-sm text-gray-500"
                  >
                    Hours
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    min="0"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="minutes"
                    className="mb-1 block text-sm text-gray-500"
                  >
                    Minutes
                  </Label>
                  <Input
                    id="minutes"
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(parseInt(e.target.value))}
                    min="0"
                    max="59"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="seconds"
                    className="mb-1 block text-sm text-gray-500"
                  >
                    Seconds
                  </Label>
                  <Input
                    id="seconds"
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(parseInt(e.target.value))}
                    min="0"
                    max="59"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Please ensure that your webinar duration is set to the desired
                amount (typically the length of your webinar video) to ensure
                proper functionality.{' '}
                <Link href="#" className="text-blue-600 hover:text-blue-800">
                  For more information about the webinar duration setting,
                  please click here.
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Attendee sign in</Label>
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className="mr-2 bg-gray-200 text-gray-500"
                >
                  DISABLED
                </Badge>
                <Switch
                  checked={attendeeSignIn}
                  onCheckedChange={setAttendeeSignIn}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="ml-2 size-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Enable attendee sign-in for your webinar
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Password</Label>
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className="mr-2 bg-gray-200 text-gray-500"
                >
                  DISABLED
                </Badge>
                <Button>Edit</Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="ml-2 size-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Set a password for your webinar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Domain</Label>
              <div className="flex items-center">
                <Badge className="mr-2 bg-blue-100 text-blue-800">
                  WEBINARKIT.COM
                </Badge>
                <Button>Edit</Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="ml-2 size-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Choose the domain for your webinar
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex flex-col justify-between md:flex-row md:items-center">
              <div className="mb-4 flex md:mb-0">
                <div className="mr-4 flex size-16 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                  <span className="text-xs text-gray-500">MyBrandLogo</span>
                </div>
                <div className="flex items-center">
                  <Label
                    htmlFor="brand-image"
                    className={cn(
                      'cursor-pointer',
                      'mr-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700',
                      'hover:bg-gray-50'
                    )}
                  >
                    Choose File
                  </Label>
                  <Input
                    id="brand-image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <span className="text-sm text-gray-500">
                    {brandImage ? brandImage.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-500">Brand image</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="size-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Upload your brand logo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
