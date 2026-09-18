"use client"

import styles from "./willow.module.css"

export default function LowerThirdLayout({ children }){

return(

<div className={styles.overlayRoot}>

<div className={styles.scoreboardBar}>
{children}
</div>

</div>

)

}
