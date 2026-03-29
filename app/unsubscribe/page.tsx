'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              You&apos;ve been unsubscribed
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {email && <><strong>{email}</strong> has been removed from our mailing list.</>}
              {!email && <>Your email has been removed from our mailing list.</>}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              You will no longer receive marketing emails from ExcelPro Washers.
              Service-related emails (invoices, quotes) are not affected.
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn&apos;t process your unsubscribe request. Please contact us at{' '}
              <a href="mailto:info@excelprowashers.com" className="text-blue-600 hover:underline">
                info@excelprowashers.com
              </a>{' '}
              and we&apos;ll remove you manually.
            </p>
          </>
        )}

        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Processing...</p>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
