import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { string } from 'yup';

interface getImagesResponse {
  after: ImageBitmap,
  data: Image[]
}

interface Image {
  title: string,
  description: string,
  url: string,
  ts: number,
  id: string,
} 


export default function Home(): JSX.Element {

  const getImages = async ({pageParam = null}): Promise<getImagesResponse> => {
    const { data } = await api.get('/api/images', {
      params: {
        after: pageParam
      }
    })

    return data
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'images',
    getImages,
    {getNextPageParam: (lastPage) => lastPage?.after || null}
  );

  const formattedData = useMemo(() => {
    return data?.pages?.flatMap(data => {
      return data.data.flat();
    })
  }, [data]);

  if(isLoading && !isError) return <Loading/>;
  

  if(!isLoading && isError) return <Error/>

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && <Button mt='5' onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{!isFetchingNextPage ? 'Carregar mais' : 'Carregando...'}</Button>}
      </Box>
    </>
  );
}
