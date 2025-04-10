import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

const faqs = [
  {
    question: 'Do you offer refunds?',
    answer: `We have a 7 day, $1 trial during which you can cancel any time within the 7 days before being billed again. After the 7 days, you will be billed for the full price of the plan shown on the screen.`,
  },
  {
    question: 'Can I sell offers directly on my webinars?',
    answer:
      'Yes! WebinarKit includes built-in sales tools, CTA pop-ups, and visual offers to boost conversions.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes! You can cancel anytime inside your account settings.',
  },
  {
    question: 'Can I follow up with leads after the webinar?',
    answer:
      'Yes! Use AI-powered remarketing to target attendees based on their actions.',
  },
  {
    question: 'Does WebinarKit work on my computer?',
    answer:
      "Yes! It's cloud-based and works on any device with an internet connection—no downloads required.",
  },
  {
    question: 'Can I embed my webinars on my website?',
    answer:
      'Yes! You can embed registration forms, watch rooms, and thank-you pages to drive more sign-ups.',
  },
  {
    question: 'Do I need tech skills to use WebinarKit?',
    answer:
      'No! WebinarKit is beginner-friendly with a simple plug-and-play setup.',
  },
  {
    question: 'Does WebinarKit integrate with my CRM & email tools?',
    answer:
      'Yes! It integrates with all major CRMs, autoresponders, and marketing platforms via our native integrations or Zapier, Pabbly Connect, or our public API.',
  },
  {
    question: 'Does WebinarKit host all my pages?',
    answer:
      'Yes! We host all webinar pages, including registration, watch rooms, and thank-you pages. Pro plans even come with easy built-in video hosting!',
  },
  {
    question: 'Do you offer a white-label solution?',
    answer: 'Yes! Click here to learn more about white-labeling WebinarKit.',
    isLink: true,
  },
  {
    question: 'Can I customize the registration and webinar pages?',
    answer:
      'Yes! You can customize the look and feel of all pages to match your brand.',
  },
];

const FAQ = () => {
  return (
    <section className="mx-auto max-w-6xl bg-white px-6 py-20">
      <h2 className="mb-12 text-center text-4xl font-semibold">
        Frequently asked questions
      </h2>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="mt-1 text-teal-500">
              <FaQuestionCircle size={20} />
            </div>
            <div>
              <h4 className="mb-1 font-semibold">{faq.question}</h4>
              <p className="text-gray-700">
                {faq.isLink ? (
                  <a href="/white-label" className="text-blue-600 underline">
                    {faq.answer}
                  </a>
                ) : (
                  faq.answer
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
