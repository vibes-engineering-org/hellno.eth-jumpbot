"use client";

import Frame from "./Frame";
import { useFrameSDK } from "~/hooks/useFrameSDK";

export default function MiniApp() {
  const { isSDKLoaded } = useFrameSDK();
  if (!isSDKLoaded) return <div>Loading...</div>;
  return <Frame />;
}
