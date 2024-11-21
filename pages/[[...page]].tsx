import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';
import builderConfig from '@config/builder';
import '@builder.io/widgets/dist/lib/builder-widgets-async';

// Initialize builder
builder.init(builderConfig.apiKey);

// Define types
type PageProps = {
  page: any;
  builderConfig?: any;
};

// Replace getStaticProps with getServerSideProps
export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  try {

    // Get the page content
    const page = await builder
      .get('ssr-page', {
        userAttributes: {
          urlPath: '/' + (params?.page?.join('/') || ''),
        },
      })
      .toPromise();
    
    return {
      props: {
        page: page || null,
        builderConfig: builderConfig || null,
      },
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return {
      props: {
        page: null,
        builderConfig: null,
      },
    };
  }
};

export default function Page({ page, builderConfig }: PageProps) {
  const router = useRouter();
  const isPreviewingInBuilder = useIsPreviewing();
  const show404 = !page && !isPreviewingInBuilder;

  // Handle loading state
  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {!page && <meta name="robots" content="noindex" />}
      </Head>

      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <BuilderComponent 
          model="page" 
          content={page} 
          options={{ 
            includeRefs: true,
          }}
          data={{name: 'ZuluTrade'}}
          
        />
      )}
    </>
  );
}