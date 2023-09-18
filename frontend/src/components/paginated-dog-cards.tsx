import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import { CardActionArea } from "@mui/material";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";

interface DogsType {
	id: number;
	microchipID: string;
	name: string;
	desc: string;
	image: string;
	is_sponsored: boolean;
	categories: number[];
	age: number;
	gender: string;
}
interface DogsTypeArray extends Array<DogsType> {}

interface CategoryType {
	id: number;
	name: string;
	desc: string;
}
interface CategoryTypeArray extends Array<CategoryType> {}

export default function PaginatedDogCards({
	page,
	itemsPerPage,
	dogsData,
	categories,
	viewDog,
}: {
	page: number;
	itemsPerPage: number;
	dogsData: DogsTypeArray;
	categories: CategoryTypeArray;
	viewDog: (dogID: number) => void;
}) {
	return (
		<>
			{dogsData && dogsData.length > 0 ? (
				dogsData
					.slice(
						(page - 1) * itemsPerPage,
						(page - 1) * itemsPerPage + itemsPerPage
					)
					.map((dog, index) => (
						<Grid item key={index} xs={12} sm={6} md={4}>
							<Card
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									borderRadius: 8,
								}}
								id={String(dog.id)}
							>
								<CardActionArea onClick={() => viewDog(dog.id)}>
									<CardMedia
										component="div"
										sx={{
											pt: "56.25%",
										}}
										image={
											dog.image
												? dog.image
												: "https://icons.veryicon.com/png/o/animal/pet-icon/dog-24.png"
										}
									/>
									<CardContent sx={{ flexGrow: 1 }}>
										<Typography gutterBottom variant="h6" component="h6">
											{dog.name}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{dog.desc}
										</Typography>
									</CardContent>
								</CardActionArea>
								<CardActions
									sx={{
										overflowX: "auto",
										whiteSpace: "nowrap",
										"&::-webkit-scrollbar": {
											height: ".5em",
										},
										"&::-webkit-scrollbar-thumb": {
											backgroundColor: "#ccc",
										},
									}}
								>
									{dog.categories &&
										dog.categories.map((category, index) => (
											<Chip
												label={
													categories?.find((obj) => obj.id === category)
														?.name ?? null
												}
												key={index}
												variant="outlined"
												color="info"
											/>
										))}
								</CardActions>
							</Card>
						</Grid>
					))
			) : (
				<Grid item>
					<h1>No Dogs Found!</h1>
				</Grid>
			)}
		</>
	);
}
