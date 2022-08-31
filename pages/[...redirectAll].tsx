// pages/[...redirectAll].tsx
import { FunctionComponent } from 'react';
import { GetServerSideProps } from 'next';

const RedirectAll: FunctionComponent = () => <></>;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    permanent: false,
    destination: '/',
  },
});

export default RedirectAll;
