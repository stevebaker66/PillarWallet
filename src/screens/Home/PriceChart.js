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
import { VictoryChart, VictoryLine } from 'victory-native';
import styled from 'styled-components/native';

// Utils
import { BigNumber } from 'utils/common';
import { formatPercentValue } from 'utils/format';
import { useThemeColors } from 'utils/themes';
import { fontSizes } from 'utils/variables';
import { useAssetCategoriesConfig } from 'utils/uiConfig';

// Types

// Local
import SmallButton from './components/SmallButton';
import { usePriceChartData } from './utils';

type Props = {||};

function PriceChart(props: Props) {
  const [activeInterval, setActiveInterval] = React.useState<?number>(7);

  const chartData = usePriceChartData(activeInterval).map(({ balance, timestamp }) => ({ x: timestamp, y: balance }));

  const colors = useThemeColors();

  const intervals = [
    { value: 1, title: '1 D' },
    { value: 7, title: '7 D' },
    { value: 30, title: '30 D' },
    { value: 182, title: '6 M' },
    { value: 365, title: '1 Y' },
    { value: null, title: 'ALL' },
  ];

  return (
    <Container>
      <VictoryChart>
        <VictoryLine
          data={chartData}
          interpolation="natural"
          style={{ data: { stroke: colors.lineChartLine, strokeWidth: 2.4, strokeLinecap: 'round' } }}
        />
      </VictoryChart>
      <IntervalContainer>
        {intervals.map(({ value, title }) => (
          <SmallButton
            key={title}
            title={title}
            onPress={() => setActiveInterval(value)}
            active={value === activeInterval}
          />
        ))}
      </IntervalContainer>
    </Container>
  );
}

export default PriceChart;

const Container = styled.View`
  justify-content: flex-end;
  align-items: stretch;
  height: 320px;
`;

const IntervalContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;
