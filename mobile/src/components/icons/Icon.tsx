// Pure Native Vector Icon System for Guidely Mobile
// High-performance canvas/path based icons designed for Android

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export type IconName =
  | 'compass'
  | 'users'
  | 'folder-kanban'
  | 'calendar'
  | 'message-square'
  | 'bell'
  | 'shield-check'
  | 'check-circle'
  | 'alert-circle'
  | 'clock'
  | 'star'
  | 'video'
  | 'plus'
  | 'search'
  | 'filter'
  | 'arrow-right'
  | 'arrow-left'
  | 'logout'
  | 'settings'
  | 'send'
  | 'edit'
  | 'trash'
  | 'close'
  | 'key'
  | 'globe'
  | 'lock'
  | 'unlock'
  | 'more-vertical'
  | 'refresh'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'graduation-cap'
  | 'briefcase'
  | 'code'
  | 'sparkles'
  | 'check'
  | 'external-link'
  | 'paperclip'
  | 'eye'
  | 'eye-off'
  | 'bar-chart'
  | 'camera'
  | 'share'
  | 'download'
  | 'play'
  | 'file';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#0F172A',
  style
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {renderIconGlyph(name, size, color)}
    </View>
  );
};

// Simplified SVG Path & Glyph definitions rendered with native vector shapes
function renderIconGlyph(name: IconName, size: number, color: string) {
  const strokeWidth = 2;
  const half = size / 2;

  switch (name) {
    case 'compass':
      return (
        <View style={{ width: size, height: size, borderRadius: half, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.45, height: size * 0.45, transform: [{ rotate: '45deg' }], backgroundColor: color, borderRadius: 2 }} />
        </View>
      );

    case 'users':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: 99, borderWidth: strokeWidth, borderColor: color, marginBottom: 2 }} />
          <View style={{ width: size * 0.8, height: size * 0.35, borderTopLeftRadius: size * 0.4, borderTopRightRadius: size * 0.4, borderWidth: strokeWidth, borderColor: color, borderBottomWidth: 0 }} />
        </View>
      );

    case 'folder-kanban':
      return (
        <View style={{ width: size * 0.9, height: size * 0.75, borderRadius: 3, borderWidth: strokeWidth, borderColor: color, padding: 2, flexDirection: 'row', gap: 2 }}>
          <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ flex: 1, borderWidth: 1, borderColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'calendar':
      return (
        <View style={{ width: size * 0.85, height: size * 0.85, borderRadius: 4, borderWidth: strokeWidth, borderColor: color, padding: 2 }}>
          <View style={{ height: 3, backgroundColor: color, marginBottom: 2 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            <View style={{ width: 2, height: 2, backgroundColor: color }} />
            <View style={{ width: 2, height: 2, backgroundColor: color }} />
            <View style={{ width: 2, height: 2, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'message-square':
      return (
        <View style={{ width: size * 0.85, height: size * 0.75, borderRadius: 4, borderWidth: strokeWidth, borderColor: color, position: 'relative' }}>
          <View style={{ position: 'absolute', bottom: -4, left: 3, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color }} />
        </View>
      );

    case 'bell':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.65, height: size * 0.6, borderTopLeftRadius: 99, borderTopRightRadius: 99, borderWidth: strokeWidth, borderColor: color }} />
          <View style={{ width: size * 0.8, height: strokeWidth, backgroundColor: color }} />
          <View style={{ width: 4, height: 3, backgroundColor: color, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, marginTop: 1 }} />
        </View>
      );

    case 'shield-check':
      return (
        <View style={{ width: size * 0.85, height: size * 0.9, alignItems: 'center', justifyContent: 'center', borderWidth: strokeWidth, borderColor: color, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: size * 0.45, borderBottomRightRadius: size * 0.45 }}>
          <View style={{ width: 4, height: 7, borderBottomWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
        </View>
      );

    case 'check-circle':
      return (
        <View style={{ width: size * 0.9, height: size * 0.9, borderRadius: 99, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.25, height: size * 0.45, borderBottomWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
        </View>
      );

    case 'alert-circle':
      return (
        <View style={{ width: size * 0.9, height: size * 0.9, borderRadius: 99, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: strokeWidth, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: strokeWidth, height: strokeWidth, backgroundColor: color, borderRadius: 1, marginTop: 2 }} />
        </View>
      );

    case 'clock':
      return (
        <View style={{ width: size * 0.9, height: size * 0.9, borderRadius: 99, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: strokeWidth, height: size * 0.3, backgroundColor: color, top: size * 0.15 }} />
          <View style={{ position: 'absolute', height: strokeWidth, width: size * 0.25, backgroundColor: color, right: size * 0.2 }} />
        </View>
      );

    case 'star':
      return (
        <View style={{ width: size * 0.85, height: size * 0.85, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.75, height: size * 0.75, backgroundColor: color, transform: [{ rotate: '45deg' }], borderRadius: 2 }} />
        </View>
      );

    case 'video':
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <View style={{ width: size * 0.6, height: size * 0.5, borderRadius: 3, borderWidth: strokeWidth, borderColor: color }} />
          <View style={{ width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderRightWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: color, transform: [{ rotate: '180deg' }] }} />
        </View>
      );

    case 'plus':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: size * 0.7, height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ position: 'absolute', height: size * 0.7, width: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'search':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.55, height: size * 0.55, borderRadius: 99, borderWidth: strokeWidth, borderColor: color, top: -2, left: -2 }} />
          <View style={{ position: 'absolute', width: strokeWidth, height: size * 0.35, backgroundColor: color, transform: [{ rotate: '-45deg' }], bottom: 2, right: 3 }} />
        </View>
      );

    case 'filter':
      return (
        <View style={{ width: size * 0.8, height: size * 0.7, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ width: '100%', height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: '65%', height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: '30%', height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'arrow-right':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
          <View style={{ width: size * 0.6, height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: size * 0.3, height: size * 0.3, borderTopWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }], marginLeft: -size * 0.15 }} />
        </View>
      );

    case 'arrow-left':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
          <View style={{ width: size * 0.3, height: size * 0.3, borderBottomWidth: strokeWidth, borderLeftWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }], marginRight: -size * 0.15 }} />
          <View style={{ width: size * 0.6, height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'logout':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.5, height: size * 0.7, borderLeftWidth: strokeWidth, borderTopWidth: strokeWidth, borderBottomWidth: strokeWidth, borderColor: color, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, position: 'absolute', left: 2 }} />
          <View style={{ position: 'absolute', right: 2, width: size * 0.45, height: strokeWidth, backgroundColor: color }} />
        </View>
      );

    case 'send':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.45, borderRightWidth: size * 0.45, borderBottomWidth: size * 0.7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, transform: [{ rotate: '90deg' }] }} />
        </View>
      );

    case 'trash':
      return (
        <View style={{ width: size * 0.7, height: size * 0.8, alignItems: 'center' }}>
          <View style={{ width: size * 0.8, height: 2, backgroundColor: color, marginBottom: 2 }} />
          <View style={{ flex: 1, width: '80%', borderWidth: strokeWidth, borderColor: color, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
        </View>
      );

    case 'edit':
      return (
        <View style={{ width: size * 0.7, height: size * 0.7, borderWidth: strokeWidth, borderColor: color, borderRadius: 2, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: strokeWidth, height: size * 0.4, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
        </View>
      );

    case 'close':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: size * 0.7, height: strokeWidth, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
          <View style={{ position: 'absolute', width: size * 0.7, height: strokeWidth, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'check':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.35, height: size * 0.6, borderBottomWidth: strokeWidth + 0.5, borderRightWidth: strokeWidth + 0.5, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
        </View>
      );

    case 'chevron-down':
      return (
        <View style={{ width: size * 0.4, height: size * 0.4, borderBottomWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -3 }} />
      );

    case 'chevron-right':
      return (
        <View style={{ width: size * 0.4, height: size * 0.4, borderTopWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }] }} />
      );

    case 'chevron-left':
      return (
        <View style={{ width: size * 0.4, height: size * 0.4, borderBottomWidth: strokeWidth, borderLeftWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }] }} />
      );

    case 'graduation-cap':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.8, height: size * 0.35, backgroundColor: color, transform: [{ rotate: '45deg' }], borderRadius: 2 }} />
          <View style={{ width: size * 0.4, height: 4, backgroundColor: color, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginTop: 2 }} />
        </View>
      );

    case 'briefcase':
      return (
        <View style={{ width: size * 0.85, height: size * 0.7, borderRadius: 3, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: -3, width: size * 0.4, height: 3, borderWidth: strokeWidth, borderColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderBottomWidth: 0 }} />
          <View style={{ width: '100%', height: 1, backgroundColor: color }} />
        </View>
      );

    case 'sparkles':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.6, height: size * 0.6, backgroundColor: color, transform: [{ rotate: '45deg' }], borderRadius: 2 }} />
        </View>
      );

    case 'lock':
      return (
        <View style={{ width: size * 0.7, height: size * 0.8, alignItems: 'center', justifyContent: 'flex-end' }}>
          <View style={{ width: size * 0.4, height: size * 0.35, borderTopLeftRadius: 99, borderTopRightRadius: 99, borderWidth: strokeWidth, borderColor: color, borderBottomWidth: 0, marginBottom: -1 }} />
          <View style={{ width: '100%', height: size * 0.45, borderRadius: 3, borderWidth: strokeWidth, borderColor: color }} />
        </View>
      );

    case 'unlock':
      return (
        <View style={{ width: size * 0.7, height: size * 0.8, alignItems: 'center', justifyContent: 'flex-end' }}>
          <View style={{ width: size * 0.4, height: size * 0.35, borderTopLeftRadius: 99, borderTopRightRadius: 99, borderWidth: strokeWidth, borderColor: color, borderBottomWidth: 0, marginLeft: -size * 0.15, marginBottom: -1 }} />
          <View style={{ width: '100%', height: size * 0.45, borderRadius: 3, borderWidth: strokeWidth, borderColor: color }} />
        </View>
      );

    case 'eye':
    case 'eye-off':
      return (
        <View style={{ width: size * 0.85, height: size * 0.5, borderRadius: size * 0.4, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: 99, backgroundColor: color }} />
          {name === 'eye-off' && (
            <View style={{ position: 'absolute', width: size * 0.8, height: strokeWidth, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
          )}
        </View>
      );

    case 'bar-chart':
      return (
        <View style={{ width: size * 0.8, height: size * 0.7, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ width: strokeWidth + 1, height: '40%', backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: strokeWidth + 1, height: '90%', backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: strokeWidth + 1, height: '65%', backgroundColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'camera':
      return (
        <View style={{ width: size * 0.85, height: size * 0.7, borderRadius: 3, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: -3, left: 4, width: size * 0.25, height: 3, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: 99, borderWidth: strokeWidth, borderColor: color }} />
        </View>
      );

    case 'share':
      return (
        <View style={{ width: size * 0.8, height: size * 0.8, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'download':
      return (
        <View style={{ width: size * 0.85, height: size * 0.85, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: strokeWidth, height: size * 0.5, backgroundColor: color }} />
          <View style={{ width: size * 0.35, height: size * 0.35, borderBottomWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -size * 0.2 }} />
          <View style={{ width: size * 0.7, height: strokeWidth, backgroundColor: color, marginTop: 4 }} />
        </View>
      );

    case 'play':
      return (
        <View style={{ width: size * 0.7, height: size * 0.7, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.45, borderTopWidth: size * 0.28, borderBottomWidth: size * 0.28, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color, marginLeft: 2 }} />
        </View>
      );

    case 'file':
      return (
        <View style={{ width: size * 0.7, height: size * 0.85, borderRadius: 2, borderWidth: strokeWidth, borderColor: color, padding: 2 }}>
          <View style={{ width: '60%', height: 2, backgroundColor: color, marginBottom: 2 }} />
          <View style={{ width: '80%', height: 2, backgroundColor: color }} />
        </View>
      );

    case 'settings':
      return (
        <View style={{ width: size * 0.85, height: size * 0.85, borderRadius: 99, borderWidth: strokeWidth + 1, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: 99, backgroundColor: color }} />
        </View>
      );

    default:
      return (
        <View style={{ width: size * 0.6, height: size * 0.6, borderRadius: 2, backgroundColor: color }} />
      );
  }
}
