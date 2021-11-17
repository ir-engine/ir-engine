import { BigNumber, utils } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Input, Select } from 'theme-ui'
import { useAppState } from '../../state'
import { Token } from '..'
import { fetcherMetadata, fetchOwner } from '../../utils/fetchers'
import useSWR from 'swr'
import { METADATA_API } from '../../utils'
import { Accordian } from './Accordian'


export type GalleryProps = {}
type StateOrder = 'price' | 'alpha'



const Gallery = () => {
  let { user, tokensOnSale } = useAppState()
  const updateTokensOnSale = useAppState(
    useCallback(({ updateTokensOnSale }) => updateTokensOnSale, [])
  )

  const [order, setOrder] = useState<StateOrder>('alpha')
  let [tokenData, setTokeata] = useState([] as any | undefined);
  let [playerData, setPlayerData] = useState(([] as any | undefined));
  let [backUpPData, setbackUpPData] = useState(([] as any | undefined));
  let [resetData, setResetata] = useState(([] as any | undefined));
  let [traitcategories, setTraitCategories] = useState(([] as any | undefined));
  const [mounted, setMounted] = useState(false)
  const { data } = useSWR(mounted ? `${METADATA_API}/token` : null, fetcherMetadata)
  // const { data } = useSWR(`${METADATA_API}/token/${data?.id}`, fetcherMetadata)
  useEffect(() => {
    setMounted(true);
    fetch("https://kt105wr4m9.execute-api.us-west-1.amazonaws.com/prod/token")
      .then(async data => {
        let pdata = await data.json();
        setbackUpPData([...pdata])
        setPlayerData([...pdata])
        // console.log("FETCH ", pdata,backUpPData);
        let cat: any = [];
        let traitobj: any = {
          height: [],
          weight: [],
          age: [],
          level: [],
          stamina: [],
          personality: []
        }
        let dispobj: any = {}
        pdata.forEach((data: any) => {

          let attr = data.attributes;
          attr.forEach((av: any, index: number) => {
            if (traitobj[av['trait_type']] != undefined && traitobj[av['trait_type']] instanceof Array) {
              // if (!traitobj[av['trait_type']].includes(av['value']))
              //   traitobj[av['trait_type']].push(av['value'])
              if (!traitobj[av['trait_type']].some((x:any)=> x.value===av['value']))
                traitobj[av['trait_type']].push({value:av['value'],clicked:false})

            }
          })
          // if(!cat.includes(data.))
        });
        console.log("CATEGORY ", traitobj);
        setTraitCategories(traitobj)

      })
      .catch(err => console.log(err));
  }, [])

  let setPlayerDatas = () => {

    // console.log("arr ", tokenData, playerData);
    let arr: any = []
    tokenData.forEach((e: any, i: number) => {
      let obj = {};
      obj = { ...e, ...playerData[i] }
      arr.push(obj)
    });
    setbackUpPData(arr)
    setResetata(arr)
    console.log("arr2 ", arr);
  }

  useEffect(() => {
    if (mounted && tokenData.length > 0 && playerData.length > 0) {
      setPlayerDatas();
    }
  }, [tokenData, playerData])

  useEffect(() => {
    if (tokensOnSale)
      setTokeata([...tokensOnSale])


  }, [tokensOnSale])


  useEffect(() => {
    updateTokensOnSale()
  }, [updateTokensOnSale])

  let filteredData = [] as any
  const searchPlayer = (e: any) => {
    e.stopPropagation();

    if (e.target.value) {
      filteredData = resetData?.filter((x: any) => x.name.toLowerCase().includes(e.target.value.toLowerCase()));
      console.log("Search ", filteredData);

      setbackUpPData([...filteredData])
    }
    else {
      console.log("backUpPData ", backUpPData);

      setbackUpPData([...resetData])
    }



  }

  const getAttributes = (attr: any) => {
    console.log("attr ", attr);

  }

  const filterData = (opt: string) => {
    // if (e.target.value) {
    //   let [data, opt] = e.target.value.split("-");
    //   console.log(data, opt);
    //   if (data === "price") {
    //     backUpPData = backUpPData
    //       ?.sort((a: any, b: any) =>
    //         opt === 'asc'
    //           ? BigNumber.from(a.price)
    //             .toString()
    //             .localeCompare(BigNumber.from(b.price).toString(), undefined, { numeric: true })
    //           : BigNumber.from(b.price)
    //           .toString()
    //           .localeCompare(BigNumber.from(a.price).toString(), undefined, { numeric: true })
    //       )
    //       console.log(tokenData);

    //   }



    // }
    backUpPData = backUpPData
      ?.sort((a: any, b: any) =>
        opt === 'asc'
          ? BigNumber.from(a.price)
            .toString()
            .localeCompare(BigNumber.from(b.price).toString(), undefined, { numeric: true })
          : BigNumber.from(b.price)
            .toString()
            .localeCompare(BigNumber.from(a.price).toString(), undefined, { numeric: true })
      )
    console.log(tokenData);
    setbackUpPData([...backUpPData])

  }

  const sortData = (e: any) => {
    const { value } = e.target;
    let [data, opt] = e.target.value.split("-");
    console.log(data, opt);
    if (opt === "asc") {
      if (data != "price") {
        console.log("BEF ", backUpPData);
        backUpPData.sort(dynamicSort(data));
        console.log("AFT ", backUpPData);
        setbackUpPData([...backUpPData])
      }
      else {
        filterData('asc')
      }


    }
    else if (opt === "des") {
      if (data != "price") {
        console.log("BEF ", backUpPData);
        backUpPData.sort(dynamicSort("-" + data));
        console.log("AFT ", backUpPData);
        setbackUpPData([...backUpPData])
      } else {
        filterData('des')
      }



    }

  }

  const resetClickValue = () => {
    Object.keys(traitcategories).forEach((da:any) => {
      traitcategories[da].forEach((kyData:any) => kyData.clicked = false)
    })
    console.log("traitcategories ", traitcategories);
  }

  const selectedTrait = (ky:any,data:any,ix:number) => {
    resetClickValue()

    traitcategories[ky][ix].clicked = true;
    let selectedData = resetData.filter((da:any) => da.attributes.some((x:any) => (x['trait_type']==ky && x['value']==data.value)))
    console.log(selectedData);
    setTraitCategories(traitcategories);
    setbackUpPData(selectedData)

    
    
  }

  const resetTrait = () => {
    resetClickValue()
    setbackUpPData(resetData)
  }

  function dynamicSort(property: any) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a: any, b: any) {
      /* next line works with strings and numbers, 
       * and you may want to customize it to your needs
       */
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  return (
    <Box>
      <Heading as="h1">Marketplace</Heading>
      {/* <Flex sx={{ alignItems: 'center' }} mb={3}>
        <Heading as="h3" sx={{ color: 'lightGray' }}>
          Order:
        </Heading>
        <Flex ml={3}>
          <Button
            mr={2}
            onClick={() => setOrder('alpha')}
            variant="filter"
            disabled={order === 'alpha'}
          >
            Alphabetically
          </Button>
          <Button onClick={() => setOrder('price')} variant="filter" disabled={order === 'price'}>
            Price
          </Button>
        </Flex>
      </Flex> */}
      <div >
        
      <Accordian title="TRAIT">
     
        {
         traitcategories && Object.keys(traitcategories).map((ky: any, index: number) => {
            return (
              <div style={{display:"flex",paddingBottom:"8px",borderBottom:"1px solid grey",paddingTop:"9px"}}>
                
                <Heading as="div" sx={{ color: 'lightGray', fontWeight:"bolder" }}>
                  {ky.toUpperCase()}:
                </Heading>
                <Flex ml={3}>
                  {/* <Button
                    mr={2}
                    onClick={() => setOrder('alpha')}
                    variant="filter"
                    disabled={order === 'alpha'}
                  >
                    Alphabetically
                  </Button>
                  <Button onClick={() => setOrder('price')} variant="filter" disabled={order === 'price'}>
                    Price
                  </Button> */}
                  {
                    traitcategories[ky].map((data:any,ix:number) => <div onClick={(e)=>selectedTrait(ky,data,ix)}
                    style={{display:"inline-block",marginRight:"3px", padding:"0 25px", height:"38px",lineHeight:"38px",fontSize:"15px",borderRadius:"25px",backgroundColor:data.clicked === true?"#0074cc": "#524f4f",cursor:"pointer"}}>{data.value}</div>)
                  }
                </Flex>
                 
              </div>
            )
          })
        }
         <div>
                    <Button mr={2} mt={2} mb={2} onClick={resetTrait}>RESET</Button>
                  </div>
    </Accordian>
      </div>
      <div style={{ marginBottom: "20px", marginTop:"20px" }}>
        <Select defaultValue="Hello" onChange={sortData}>
          <option value="">Select Filter</option>
          <option value="name-asc">Name(Z-A)</option>
          <option value="name-des">Name(A-Z)</option>
          <option value="price-asc">Price(Low-High)</option>
          <option value="price-des">Price(High-Low)</option>
        </Select>
      </div>
      <Flex ml={3}>

      </Flex>

      <Flex >
        <Box p={2} bg="primary" sx={{ flex: '1 1 auto' }}>
          <Input placeholder="Search" onChange={searchPlayer} />
        </Box>

      </Flex>
      <Grid gap={4} columns={['1fr 1fr', '1fr 1fr', '1fr 1fr 1fr']}>
        {backUpPData.length > 0 && backUpPData
          // ?.sort((a: any, b: any) =>
          //   order === 'alpha'
          //     ? BigNumber.from(a.id)
          //       .toString()
          //       .localeCompare(BigNumber.from(b.id).toString(), undefined, { numeric: true })
          //     : Number(utils.formatEther(a.price.sub(b.price)))
          // )
          ?.map((i: any, index: number) => (
            <Token onBuy={!user?.ownedTokens.find(t => t.id === i.id)} token={i} key={index} />

            // <Token pdata={tokenData[index]} onBuy={!user?.ownedTokens.find(t => t.id === tokenData[index].id)} token={tokenData[index]} key={index} ind={index} />
          ))}
      </Grid>
    </Box>
  )
}

export { Gallery }
