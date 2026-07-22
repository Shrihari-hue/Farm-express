import { View, StyleSheet } from "react-native";
import { Sprout } from "lucide-react-native";
import { Screen, Text, Button, Card } from "@components/ui";
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, radii } from "@constants/theme";

/**
 * Placeholder sign-in screen. It exists now purely to prove out the
 * navigation shell and design system end-to-end; the real Email OTP /
 * Phone OTP / Google Login flows are implemented in Step 3 (Authentication)
 * and will replace the body of this screen without touching the route
 * structure or the providers wired up in Step 1.
 */
export default function LoginScreen() {
  const theme = useAppTheme();

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={[styles.logoWrap, { backgroundColor: theme.primarySoft }]}>
        <Sprout size={36} color={theme.primary} />
      </View>

      <Text variant="display" align="center" style={styles.title}>
        Farm Express
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
        Manage labour, attendance, salary, stock and sales — all in one place.
      </Text>

      <Card style={styles.card}>
        <Text variant="bodyStrong">Sign-in is coming in Step 3</Text>
        <Text variant="caption" color="secondary" style={styles.cardCopy}>
          Email OTP, Phone OTP and Google Login will appear here, backed by Supabase Auth and
          role-based routing to the Owner, Supervisor or Labour experience.
        </Text>
        <Button label="Continue" disabled style={styles.continueButton} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  logoWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: { marginBottom: spacing.xxs },
  subtitle: { marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  card: { gap: spacing.xs },
  cardCopy: { marginBottom: spacing.sm },
  continueButton: { marginTop: spacing.xxs },
});
