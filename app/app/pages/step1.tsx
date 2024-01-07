import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Step1 = () => {
  return (
    <div>
      <Head>
        <title>Step 1: Introduction</title>
        <meta name="description" content="Introduction to step 1" />
      </Head>

      <main>
        <h1>Step 1: Introduction</h1>
        <p>This is the first step in our process.</p>

        {/* Add more content and components as needed for Step 1 */}

        {/* Navigation Links */}
        <nav>
          <ul>
            <li>
              <Link href="/">
                <a>Back to Home</a>
              </Link>
            </li>
            {/* Add links to other steps as needed */}
          </ul>
        </nav>
      </main>
    </div>
  );
};

export default Step1;
