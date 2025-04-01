'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import WebinarStep1 from './webinarStep1';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProgressBar from '@/components/ui/ProgressBar';

export default function WebinarSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

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
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Step-Based Forms */}
      <Card className="mx-4 mb-6 md:mx-6">
        <CardHeader>
          <CardTitle>
            {currentStep === 3 ? 'Additional Details' : 'Webinar Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && <WebinarStep1 />}

          {currentStep === 1 && (
            <div>
              <Label htmlFor="register-email" className="text-gray-500">
                Email
              </Label>
              <Input id="register-email" type="email" />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <Label htmlFor="watch-link" className="text-gray-500">
                Webinar Link
              </Label>
              <Input id="watch-link" type="url" />
            </div>
          )}

          {/* {currentStep === 3 && <NewFormComponent />} */}
          {currentStep === 3 && (
            <>
              <div className="space-y-4 rounded-md bg-white p-6 shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">
                  Additional Details
                </h2>

                <div>
                  <Label htmlFor="company-name" className="text-gray-500">
                    Company Name
                  </Label>
                  <Input id="company-name" type="text" />
                </div>

                <div>
                  <Label htmlFor="website" className="text-gray-500">
                    Website
                  </Label>
                  <Input id="website" type="url" />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-500">
                    Phone
                  </Label>
                  <Input id="phone" type="tel" />
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
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
              disabled={currentStep === 3}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
