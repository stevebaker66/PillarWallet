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

// Controls
import ValueOverTimeGraph, { type DataPoint } from 'components/modern/ValueOverTimeGraph';

// Selectors
import { useRootSelector, useFiatCurrency, activeAccountAddressSelector } from 'selectors';

// Services
import etherspotService from 'services/etherspot';

// Types
import type { ViewStyleProp } from 'utils/types/react-native';

type Props = {|
  style?: ViewStyleProp;
|};

function ValueLineChart({ style }: Props) {
  const chartData = useValueChartData();

  return <Container style={style}>{!!chartData.length && <ValueOverTimeGraph data={chartData} />}</Container>;
}

export default ValueLineChart;

export function useValueChartData(): DataPoint[] {
  const accountAddress = useRootSelector(activeAccountAddressSelector);
  const currency = useFiatCurrency();
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const dashboardData = await etherspotService.getDashboardData(accountAddress, currency, 10000);
      if (!dashboardData) return;

      setData(
        dashboardData.history.map((point) => ({
          date: new Date(point.timestamp),
          value: point.balance,
        })),
      );
    };

    fetchData();
  }, [accountAddress, currency]);

  return data;
}

const Container = styled.View`
  justify-content: flex-end;
  align-items: stretch;
  height: 340px;
`;

