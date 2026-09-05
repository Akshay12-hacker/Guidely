// Type definitions for Google Identity Services (GIS) Web SDK

declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string; // The Google ID Token JWT
    select_by?: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm';
    clientId?: string;
  }

  interface IdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    ux_mode?: 'popup' | 'redirect';
    login_uri?: string;
    native_callback?: (response: any) => void;
    intermediate_iframe_close_callback?: () => void;
    itp_support?: boolean;
  }

  interface GsiButtonConfiguration {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string | number;
    locale?: string;
    click_listener?: () => void;
  }

  interface PromptMomentNotification {
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () => string;
    isSkippedMoment: () => boolean;
    getSkippedReason: () => string;
    isDismissedMoment: () => boolean;
    getDismissedReason: () => string;
    getMomentType: () => string;
  }

  function initialize(config: IdConfiguration): void;
  function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
  function prompt(momentListener?: (notification: PromptMomentNotification) => void): void;
  function disableAutoSelect(): void;
  function revoke(hint: string, callback?: (done: { successful: boolean; error?: string }) => void): void;
}

declare namespace google.accounts.oauth2 {
  interface CodeResponse {
    code: string;
    scope: string;
    state?: string;
    error?: string;
    error_description?: string;
    error_uri?: string;
  }

  interface CodeClientConfig {
    client_id: string;
    scope: string;
    callback: (response: CodeResponse) => void;
    error_callback?: (error: any) => void;
    state?: string;
    enable_granular_consent?: boolean;
    login_hint?: string;
    hd?: string;
    ux_mode?: 'popup' | 'redirect';
    redirect_uri?: string;
  }

  interface CodeClient {
    requestCode: () => void;
  }

  function initCodeClient(config: CodeClientConfig): CodeClient;
}

interface Window {
  google?: {
    accounts: {
      id: typeof google.accounts.id;
      oauth2: typeof google.accounts.oauth2;
    };
  };
}
