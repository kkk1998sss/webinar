'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import WebinarStep1 from './webinarStep1';
import WebinarStep2 from './webinarStep2';
import WebinarStep3 from './webinarStep3';
import WebinarSettings from './webinarStep4';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressBar from '@/components/ui/ProgressBar';
import { WebinarFormData } from '@/types/user';

export default function WebinarSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState<WebinarFormData>({
    webinarId: '',
    webinarName: '',
    webinarTitle: '',
    duration: { hours: 0, minutes: 0, seconds: 0 },
    attendeeSignIn: false,
    passwordProtected: false,
    webinarDate: '',
    webinarTime: '',
    selectedValue: '',
    brandImage: '',
    instantWatch: false,
    instantWatchSession: '',
    justInTime: false,
    justInTimeSession: '',
    scheduledDates: [], // ✅ Correct type

    emailNotifications: {
      confirmation: true,
      oneDayReminder: true,
      thirtyMinuteReminder: true,
    },
    textNotifications: {
      confirmation: true,
      oneDayReminder: false,
      thirtyMinuteReminder: false,
    },
    integration: '',
    webinarSharing: {
      enabled: false,
      name: '',
      url: '',
    },
  });

  const nextStep = async () => {
    if (currentStep === 3) {
      try {
        const response = await fetch('/api/webinar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('Webinar created!');
        } else {
          alert('Failed to create webinar.');
        }
      } catch (error) {
        console.error(error);
        alert('Error submitting webinar.');
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 md:p-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/users/live-webinar"
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
        </div>
      </div>

      <ProgressBar currentStep={currentStep} />

      <Card className="mx-4 mb-6 md:mx-6">
        <CardHeader>
          <CardTitle>
            {currentStep === 3 ? 'Additional Details' : 'Webinar Details'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {currentStep === 0 && (
            <WebinarStep1 formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 1 && (
            // <WebinarStep2 formData={formData} setFormData={setFormData} />
            <WebinarStep2 />
          )}

          {currentStep === 2 && <WebinarStep3 />}

          {currentStep === 3 && (
            <WebinarSettings formData={formData} setFormData={setFormData} />
          )}

          <div className="mt-6 flex justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={nextStep}
              className="bg-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
            >
              {currentStep === 3 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
