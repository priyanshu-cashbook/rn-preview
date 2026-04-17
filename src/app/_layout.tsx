import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useDeploymentBootstrap } from "@/features/deployments/hooks/use-deployment-bootstrap";
import { withCodePush } from "@/services/revopush/client";

function RootLayout() {
  useDeploymentBootstrap();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: "#102A43",
          },
          headerTintColor: "#F8FAFC",
          drawerStyle: {
            backgroundColor: "#F4F8FB",
          },
          drawerActiveTintColor: "#7C3AED",
          drawerInactiveTintColor: "#486581",
          sceneStyle: {
            backgroundColor: "#F4F8FB",
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Home",
            title: "Branch Preview Home",
          }}
        />
        <Drawer.Screen
          name="preview"
          options={{
            drawerLabel: "Preview Switcher",
            title: "Preview Deployments",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default withCodePush(RootLayout);
