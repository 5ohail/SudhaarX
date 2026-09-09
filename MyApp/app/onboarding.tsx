import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Palette, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { Button } from "@/components/ui/Button";

const { width } = Dimensions.get("window");

export const ONBOARDING_KEY = "@sudhaarx_onboarding_completed";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: "1",
    title: "Spot a Problem",
    subtitle: "Identify potholes, garbage, streetlights, or drainage hazards in your neighborhood effortlessly.",
    icon: "search-outline",
    badge: "STEP 1",
    accentColor: "#008545",
  },
  {
    id: "2",
    title: "Report It with AI",
    subtitle: "Snap a photo. Our AI automatically classifies the issue, estimates severity, and tags precise GPS location.",
    icon: "camera-outline",
    badge: "STEP 2",
    accentColor: "#007AFF",
  },
  {
    id: "3",
    title: "Track Progress",
    subtitle: "Follow your report in real-time as ward officers are assigned and work towards resolution.",
    icon: "time-outline",
    badge: "STEP 3",
    accentColor: "#F59E0B",
  },
  {
    id: "4",
    title: "Make Your City Better",
    subtitle: "Join thousands of active citizens building cleaner, safer, and smarter civic infrastructure.",
    icon: "sparkles-outline",
    badge: "IMPACT",
    accentColor: "#10B981",
  },
];

export default function OnboardingScreen() {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/profile"); // Navigate to Auth/Profile
    } catch (e) {
      console.error("Error saving onboarding status", e);
      router.replace("/profile");
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinishOnboarding();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar with Skip */}
      <View style={styles.topRow}>
        <Text style={[Typography.caption, { color: Palette.primary, fontWeight: "800", letterSpacing: 1 }]}>
          SUDHAARX
        </Text>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleFinishOnboarding} style={styles.skipBtn}>
            <Text style={[Typography.bodyBold, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.iconCircle, { backgroundColor: item.accentColor + "1A" }]}>
              <Ionicons name={item.icon} size={80} color={item.accentColor} />
            </View>

            <View style={[styles.badge, { backgroundColor: item.accentColor + "20" }]}>
              <Text style={[Typography.caption, { color: item.accentColor, fontWeight: "800" }]}>
                {item.badge}
              </Text>
            </View>

            <Text style={[Typography.display, styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? Palette.primary : colors.border,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? "Get Started" : "Continue"}
          onPress={handleNext}
          size="large"
          icon={<Ionicons name="arrow-forward" size={20} color="#FFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  skipBtn: {
    padding: Spacing.xs,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.giant,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.giant,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
