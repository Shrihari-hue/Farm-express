import { Link } from "expo-router";
import { Screen, Text } from "@components/ui";
import { spacing } from "@constants/theme";

export default function NotFoundScreen() {
  return (
    <Screen style={{ alignItems: "center", justifyContent: "center", gap: spacing.sm }}>
      <Text variant="title">This screen doesn't exist</Text>
      <Link href="/">
        <Text color="brand">Go back to the home screen</Text>
      </Link>
    </Screen>
  );
}
