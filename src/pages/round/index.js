import { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { format, parseISO, sub } from "date-fns";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

import CalIcon from "../../assets/icons/WHT_icon_Cal.svg";
import RoundCard from "../../components/round-card";
import PlaceHolder from "../../assets/images/course-placeholder.jpg";
import EnterScore from "../../components/enter-score";
import courseInfo from "../../courseInfo.json";

const RoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #162e3d;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  width: 100%;

  button {
    width: 223px;
    height: 68px;
    background-color: #be1e2d;
    border: none;
    margin: 5px;
    font-size: 20px;
    text-transform: uppercase;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
  }
`;

const RoundImage = styled.div`
  width: 100%;
  height: 400px;
  background-size: cover;
`;

const RoundDate = styled.div`
  text-transform: uppercase;
  font-family: BebasNeue;
  color: #f3e9d5;
  display: flex;
  align-items: center;

  img {
    height: 25px;
    width: 25px;
  }
`;

const HeaderText = styled.div`
  font-family: BebasNeue;
  color: #f3e9d5;
  font-size: 36px;
  display: flex;
  justify-content: space-between;
  padding-left: 15px;
  flex-wrap: wrap;
`;

const Slider = styled(Carousel)`
  width: 100%;

  .slide {
    background: #ffffff !important;
  }

  .carousel .control-arrow,
  .carousel.carousel-slider .control-arrow {
    opacity: 1;
  }

  .carousel .control-next.control-arrow::before {
    border-left: none !important;
  }

  .carousel-slider .control-prev.control-arrow::before {
    border-right: none !important;
  }

  .thumb img {
    height: 50px;
  }

  .thumbs-wrapper .control-prev::before {
    border: solid black;
    border-right: 3px solid black !important;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
  }

  .thumbs-wrapper .control-next::before {
    border: solid black;
    border-left: none !important;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }

  .carousel img {
    pointer-events: auto;
  }
`;

const FormModal = styled.div`
  position: absolute;
  background-color: rgba(22, 46, 61, 0.9);
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GHINForm = styled.form`
  display: flex;
  flex-direction: column;

  span {
    font-size: 36px;
    font-family: BebasNeue;
    text-transform: uppercase;
    color: #f3e9d5;
    margin-left: 5px;
  }
`;

const Input = styled.input`
  height: 50px;
  width: 250px;
  margin: 5px;
  padding: 5px;
  padding-left: 15px;
  font-size: 18px;
  flex: 1;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 700px;
`;

const InputRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  label {
    color: #ffffff;
    margin-right: 5px;
    padding-left: 5px;
    font-size: 18px;
  }

  select {
    margin-right: 5px;
    font-size: 18px;
  }
`;

const SubmitButton = styled.input`
  width: 134px;
  height: 68px;
  background-color: #be1e2d;
  border: none;
  margin: 5px;
  font-size: 20px;
  text-transform: uppercase;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
`;

const ModalText = styled.div`
  color: #ffffff;
  text-transform: uppercase;
  margin-top: 15px;
  margin-bottom: 15px;
  font-size: 28px;
`;

const ShortDivider = styled.hr`
  width: 100%;
  max-width: 689px;
  background-color: #be1e2d;
  color: #be1e2d;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 5px;
  margin-right: 5px;
`;

const Round = () => {
  const [openScore, setOpenScore] = useState(false);
  const [showModal, setShowModal] = useState(false);

  let { roundId } = useParams();
  const { isLoading, error, data } = useQuery("eventData", () =>
    fetch(
      `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_KEY}/events/${process.env.REACT_APP_EVENT_ID}/rounds`
    ).then((res) => res.json())
  );

  const teeSheets = useQuery("teeSheetData", () =>
    fetch(
      `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_KEY}/events/${process.env.REACT_APP_EVENT_ID}/rounds/${roundId}/tee_sheet`
    ).then((res) => res.json())
  );

  const courseData = useQuery("courseData", () =>
    fetch(
      `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_KEY}/events/${process.env.REACT_APP_EVENT_ID}/courses`
    ).then((res) => res.json())
  );

  const courseId =
    teeSheets.data &&
    teeSheets?.data[0]?.pairing_group?.players[0]?.tee?.course_id;

  const currentCourse =
    courseData.data &&
    courseData.data?.courses.filter((course) => course.id === courseId);

  const currentRound =
    (data && data.filter(({ round }) => round.id === roundId)) || [];

  const currentIndex =
    (data && data.findIndex(({ round }) => round.id === roundId)) || 0;

  const submitTeeTime = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    fetch(`/update-sheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        tee_time: formData.get("tee_time"),
      }),
    }).then((res) => {
      setShowModal(false);
    });
  };

  return (
    <RoundContainer>
      {!openScore && (
        <Slider showStatus={false} showIndicators={false} dynamicHeight={true}>
          {courseInfo[currentIndex]?.images.map((img) => (
            <RoundImage
              style={{
                backgroundImage: `linear-gradient(to top, rgba(22, 46, 61, 1), transparent), url(${img})`,
              }}
            />
          ))}
        </Slider>
      )}
      {currentRound.length > 0 && (
        <InnerContainer>
          {openScore && <EnterScore roundId={roundId} />}
          <HeaderText>
            {currentRound[0].round.name}{" "}
            <div style={{ display: "flex" }}>
              <button onClick={() => setShowModal(true)}>PLAY</button>
              <button onClick={() => setOpenScore((oldState) => !oldState)}>
                ENTER SCORE
              </button>
            </div>
          </HeaderText>

          <RoundDate>
            <img src={CalIcon} />
            {format(parseISO(currentRound[0].round.date), "MMM")}{" "}
            {format(
              sub(parseISO(currentRound[0].round.date), { days: 6 }),
              "d"
            )}{" "}
            - {format(parseISO(currentRound[0].round.date), "d")}
          </RoundDate>
          {data && data[currentIndex + 1] && (
            <>
              <HeaderText>Next Tournament</HeaderText>
              <RoundCard
                backgroundImage={PlaceHolder}
                date={data && data[currentIndex + 1].round.date}
                name={data && data[currentIndex + 1].round.name}
                link={data && `${data[currentIndex + 1].round.id}`}
              />
            </>
          )}
          {data && data[currentIndex - 1] && (
            <>
              <HeaderText>Previous Tournament</HeaderText>
              <RoundCard
                backgroundImage={PlaceHolder}
                date={data && data[currentIndex - 1].round.date}
                name={data && data[currentIndex - 1].round.name}
                link={data && `${data[currentIndex - 1].round.id}`}
              />
            </>
          )}
          {showModal && (
            <FormModal>
              <FormContainer>
                <GHINForm onSubmit={submitTeeTime}>
                  <span> {currentRound[0]?.round?.name}</span>
                  <RoundDate>
                    <img src={CalIcon} />
                    {format(parseISO(currentRound[0].round.date), "MMM")}{" "}
                    {format(
                      sub(parseISO(currentRound[0].round.date), { days: 6 }),
                      "d"
                    )}{" "}
                    - {format(parseISO(currentRound[0].round.date), "d")}
                  </RoundDate>
                  <ModalText>
                    Instructions on registering. schedule tee time, return here
                    and enter your info.
                  </ModalText>
                  <button>set tee time</button>
                  <ShortDivider />
                  <InputRow>
                    <Input required name="name" placeholder="Name" />
                  </InputRow>
                  <InputRow>
                    <Input required name="email" placeholder="Email" />
                  </InputRow>
                  <InputRow>
                    <Input required name="tee_time" placeholder="Tee Time" />
                  </InputRow>
                  <InputRow
                    style={{ justifyContent: "flex-end", paddingTop: "15px" }}
                  >
                    <SubmitButton type="submit" value="FINISHED" />
                  </InputRow>
                </GHINForm>
              </FormContainer>
            </FormModal>
          )}
        </InnerContainer>
      )}
    </RoundContainer>
  );
};

export default Round;
