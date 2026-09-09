import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = ComponentProps<typeof Link>;

export function ExternalLink({ href, onPress, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event: any) => {
        if (Platform.OS !== 'web' && typeof href === 'string') {
          event.preventDefault();
          await openBrowserAsync(href);
        }
        if (onPress) {
          onPress(event);
        }
      }}
    />
  );
}
