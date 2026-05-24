'use client';
import {trpc} from "~/trpc/client" 
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
 


export default  function Home() { 
  const router = useRouter() 
  const {data} = trpc.auth.getLoggedInUserInfo.useQuery()  

  useEffect(()=> { 

    if(data && data.id){
      router.replace('/dashboard')
    } else{
      router.replace('/login')
    }

  }, [data])


}
