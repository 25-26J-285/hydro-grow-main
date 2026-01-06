import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, View, StyleProp, ViewStyle, TextStyle, Pressable } from 'react-native'

type HeaderProps = {
  title: string
  subtitle?: string
  containerStyle?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<TextStyle>
  subtitleStyle?: StyleProp<TextStyle>
  onBackPress?: () => void
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
  subtitleStyle,
  onBackPress,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        containerStyle,
      ]}
    >
      <Pressable onPress={onBackPress} hitSlop={10}>
        <MaterialIcons name="arrow-back" size={28} color="black" />
      </Pressable>

      <View style={{ marginLeft: 12 }}>
        <Text
          style={[
            {
              fontSize: 18,
              fontWeight: '600',
              color: '#000',
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[
              {
                fontSize: 13,
                color: '#666',
                marginTop: 2,
              },
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

export default Header
