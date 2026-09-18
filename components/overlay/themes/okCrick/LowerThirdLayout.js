"use client"

import styles from "./cwc.module.css"

export default function LowerThirdLayout({ children }){

return(

<div className={styles.overlayRoot}>

<div className={styles.lowerThird}>
{children}
</div>

</div>

)

}
