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
import Icon from 'components/modern/Icon';

// Types
import type { IconName } from 'components/modern/Icon';

export type Props = {|
  iconName: IconName,
  onPress?: () => mixed,
|};

function IconButton({ iconName, onPress }: Props) {
  return (
    <TouchableContainer onPress={onPress}>
      <Icon name={iconName} />
    </TouchableContainer>
  );
}

export default IconButton;

const TouchableContainer = styled.TouchableOpacity`
  padding: 6px;
  border-radius: 4px;
  border-color: ${({ theme }) => theme.colors.basic060};
  border-width: 1px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

