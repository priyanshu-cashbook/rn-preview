import type { PropsWithChildren, ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

interface ScreenProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  headerRight?: ReactNode;
  scroll?: boolean;
  background?: string;
}

export function Screen({
  title,
  subtitle,
  headerRight,
  children,
  scroll = true,
  background,
}: ScreenProps) {
  const content = (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, background ? { backgroundColor: background } : null]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FB",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  headerRight: {
    paddingTop: 2,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    color: "#102A43",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#486581",
  },
});
