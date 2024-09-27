import dynamic from "next/dynamic";

const AuthCallbackHandler = dynamic(
  () => import("@/components/AuthCallbackHandler"),
  { ssr: false }
);

const Page = () => {
  return (
    <>
      <AuthCallbackHandler />
    </>
  );
};

export default Page;
