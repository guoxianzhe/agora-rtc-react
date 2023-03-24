import type { ConnectionState, IAgoraRTCClient } from "agora-rtc-sdk-ng";

import { useEffect, useState } from "react";
import { listen } from "../listen";

export function useConnectionState(client?: IAgoraRTCClient | null): ConnectionState {
  const [connectionState, setConnectionState] = useState(
    client ? client.connectionState : "DISCONNECTED",
  );
  useEffect(() => {
    if (client) {
      setConnectionState(client.connectionState);
      return listen(client, "connection-state-change", setConnectionState);
    } else {
      setConnectionState("DISCONNECTED");
    }
  }, [client]);
  return connectionState;
}

export function useIsConnected(client?: IAgoraRTCClient | null): boolean {
  const [isConnected, setConnected] = useState(
    client ? client.connectionState === "CONNECTED" : false,
  );
  useEffect(() => {
    if (client) {
      setConnected(client.connectionState === "CONNECTED");
      return listen(client, "connection-state-change", state => {
        setConnected(state === "CONNECTED");
      });
    } else {
      setConnected(false);
    }
  }, [client]);
  return isConnected;
}

export interface NetworkQuality {
  /**
   * The uplink network quality.
   *
   * It is calculated based on the uplink transmission bitrate, uplink packet loss rate, RTT (round-trip time) and jitter.
   *
   * - 0: The quality is unknown.
   * - 1: The quality is excellent.
   * - 2: The quality is good, but the bitrate is less than optimal.
   * - 3: Users experience slightly impaired communication.
   * - 4: Users can communicate with each other, but not very smoothly.
   * - 5: The quality is so poor that users can barely communicate.
   * - 6: The network is disconnected and users cannot communicate.
   */
  uplink: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * The downlink network quality.
   *
   * It is calculated based on the uplink transmission bitrate, uplink packet loss rate, RTT (round-trip time) and jitter.
   *
   * - 0: The quality is unknown.
   * - 1: The quality is excellent.
   * - 2: The quality is good, but the bitrate is less than optimal.
   * - 3: Users experience slightly impaired communication.
   * - 4: Users can communicate with each other, but not very smoothly.
   * - 5: The quality is so poor that users can barely communicate.
   * - 6: The network is disconnected and users cannot communicate.
   */
  downlink: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * RTT (Round-Trip Time) between the SDK and Agora's edge server, in ms.
   */
  delay: number;
}

const initQuality = (): NetworkQuality => ({
  uplink: 0,
  downlink: 0,
  delay: 0,
});

/**
 * Reports the network quality of the local user.
 *
 * After the local user joins the channel, the SDK triggers this callback to report the uplink and downlink network conditions of the local user once every two second.
 */
export function useNetworkQuality(client?: IAgoraRTCClient | null): NetworkQuality {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>(initQuality);
  useEffect(() => {
    if (client) {
      return listen(client, "network-quality", q =>
        setNetworkQuality({
          uplink: q.uplinkNetworkQuality,
          downlink: q.downlinkNetworkQuality,
          delay: client?.getRTCStats().RTT ?? 0,
        }),
      );
    } else {
      setNetworkQuality(initQuality());
    }
  }, [client]);
  return networkQuality;
}
