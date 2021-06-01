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
import { useTranslationWithPrefix } from 'translations/translate';

// Utils
import { useThemeColors } from 'utils/themes';

// Types
import type { ViewStyleProp } from 'utils/types/react-native';

// Local
import SmallButton from './SmallButton';

import priceChartData from '../mockData.json';

type Props = {|
  style?: ViewStyleProp;
|};

function ValueLineChart({ style }: Props) {
  const { t } = useTranslationWithPrefix('home.charts.value');

  const [activeInterval, setActiveInterval] = React.useState<?number>(7);

  const chartData = usePriceChartData(activeInterval).map(({ balance, timestamp }) => ({ x: timestamp, y: balance }));

  const colors = useThemeColors();

  const intervals = [
    { value: 7, title: t('7days') },
    { value: 30, title: t('30days') },
    { value: 182, title: t('6months') },
    { value: 365, title: t('1year') },
    { value: null, title: t('all') },
  ];

  return (
    <Container style={style}>
      <VictoryChart height={300}>
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

export default ValueLineChart;

export type PriceChartDatum = {|
  timestamp: string, // YYYY-MM-DD
  balance: number,
|};

export function usePriceChartData(days: ?number): PriceChartDatum[] {
  if (!days) return priceChartData;

  return priceChartData.slice(-days);
}

const styles = {
  chart: {
    height: 300,
  },
};

const Container = styled.View`
  justify-content: flex-end;
  align-items: stretch;
  height: 340px;
`;

const IntervalContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

