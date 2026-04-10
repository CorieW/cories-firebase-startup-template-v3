/**
 * Compatibility wrapper around the shared site footer social link pill.
 */
import {
  SharedSiteFooterSocialLinkButton,
} from '@cories-firebase-startup-template-v3/common/client';

interface SocialLinkProps {
  href: string;
  icon?: string;
  label: string;
}

/**
 * Renders a dashboard social link using the shared footer styling.
 */
export default function SocialLink(props: SocialLinkProps) {
  return (
    <SharedSiteFooterSocialLinkButton
      url={props.href}
      label={props.label}
      icon={props.icon}
      id={`${props.label}-${props.href}`}
    />
  );
}
