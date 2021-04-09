// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2021 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

import * as React from 'react';
import styled from 'styled-components/native';

// Components
import Text from 'components/modern/Text';

// Utils
import { useThemeColors } from 'utils/themes';

// Types
import type { ViewStyleProp } from 'utils/types/react-native';

export type Props = {|
  title: string,
  onPress?: () => mixed,
  active?: boolean,
  style?: ViewStyleProp,
|};

function IconButton({ title, active, onPress }: Props) {
  const colors = useThemeColors();

  return (
    <TouchableContainer $active={active} onPress={onPress}>
      <Text variant="small" color={active ? colors.basic010 : colors.basic030}>
        {title}
      </Text>
    </TouchableContainer>
  );
}

export default IconButton;

const TouchableContainer = styled.TouchableOpacity`
  align-items: center;
  min-width: 36px;
  padding: 9px 6px;
  border-radius: 4px;
  border-width: 1px;
  border-color: transparent;
  ${({ $active, theme }) =>
    !!$active &&
    `
    background-color: ${theme.colors.backgroundSecondary};
    border-color: ${theme.colors.basic060};
  `}
`;
